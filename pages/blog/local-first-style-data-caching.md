---
title: "Local First Style Data Caching"
description: "Architectural tricks to make your app feel faster"
date: "2025-05-31T00:00:00.000Z"
snippet: ""
tags: post
layout: layouts/post.njk
---

In the current web landscape, local first apps are often revered
as being some of the best web products to use. Some examples that come to mind
are Linear, Figma, Notion, Obsidian, etc. All of these feel fast and snappy
and instantly respond to your interactions.

However, the promise of instant feedback isn't unique to local first apps.
We can achieve this feel using good old optimistic updates, but these
aren't the prettiest to implement. Here's an example of implementing
optimistic updates with [TanStack Query](https://tanstack.com/query/latest).

```ts
const useOptimisticTodo = () => {
  const queryClient = useQueryClient();

  const { data: todos } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: { text: string }) => api.post("/todos", newTodo),

    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(["todos"]);

      // Optimistically update cache
      queryClient.setQueryData(["todos"], (old: Todo[]) => [
        ...old,
        { id: randomUUID(), text: newTodo.text, completed: false },
      ]);

      return { previousTodos };
    },

    onError: (err, newTodo, context) => {
      // Rollback on error
      queryClient.setQueryData(["todos"], context?.previousTodos);
    },

    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return { todos, addTodo: addTodoMutation.mutate };
};
```

Whilst I love TanStack Query and this may not be the cleanest way to implement
optimistic updates, it's still quite unwieldy and does not scale well as your
backend or other parts of your apps change.

This example represents a paradigm we could easily abstract, "add".
We can take our understanding of what add means and implement it Optimistically as
a guarantee. This requires our backend to also agree to this contract, that add
must always only ever add this singular item into this list, but let's explore
this more before we get into the relationship with the backend.

Lets mock out what an optimistic CRUD caching layer would look like.
The caching layer will usually be heavily coupled to your fetching solution, so
here we will couple it with TanStack Query

```ts
const API_BASE_URL = "http://localhost:3000/api";

const queryFn = async (url: string) => {
  const response = await fetch(`${API_BASE_URL}${url}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const createHooks = (queryKey: string) => {
  const useAll = () => {
    return useQuery({
      queryKey: [queryKey],
      queryFn: () => queryFn(queryKey),
    });
  };

  const useOne = (id: string) => {
    return useQuery({
      queryKey: [queryKey, id],
      queryFn: () => queryFn(`${queryKey}/${id}`),
    });
  };

  const useAdd = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (newItem: any) =>
        fetch(`${API_BASE_URL}${queryKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        }).then((res) => res.json()),

      onMutate: async (newItem) => {
        await queryClient.cancelQueries({ queryKey: [queryKey] });
        const previousData = queryClient.getQueryData([queryKey]);

        const optimisticItem = { id: randomUUID(), ...newItem };
        queryClient.setQueryData([queryKey], (old: any[]) => [
          ...(old || []),
          optimisticItem,
        ]);

        return { previousData, optimisticItem };
      },

      onSuccess: (data) => {
        queryClient.setQueryData([queryKey], (old: any[]) =>
          (old || []).map((item) => (item.id === data.id ? data : item)),
        );
      },

      onError: (err, newItem, context) => {
        queryClient.setQueryData([queryKey], context?.previousData);
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  };

  const useUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, ...updates }: any) =>
        fetch(`${API_BASE_URL}${queryKey}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }).then((res) => res.json()),

      onMutate: async ({ id, ...updates }) => {
        await queryClient.cancelQueries({ queryKey: [queryKey] });
        const previousData = queryClient.getQueryData([queryKey]);

        queryClient.setQueryData([queryKey], (old: any[]) =>
          (old || []).map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        );

        queryClient.setQueryData([queryKey, id], (old: any) => ({
          ...old,
          ...updates,
        }));

        return { previousData };
      },

      onSuccess: (data) => {
        queryClient.setQueryData([queryKey], (old: any[]) =>
          (old || []).map((item) => (item.id === data.id ? data : item)),
        );
        queryClient.setQueryData([queryKey, data.id], data);
      },

      onError: (err, variables, context) => {
        queryClient.setQueryData([queryKey], context?.previousData);
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  };

  const useRemove = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) =>
        fetch(`${API_BASE_URL}${queryKey}/${id}`, {
          method: "DELETE",
        }),

      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: [queryKey] });
        const previousData = queryClient.getQueryData([queryKey]);

        queryClient.setQueryData([queryKey], (old: any[]) =>
          (old || []).filter((item) => item.id !== id),
        );

        queryClient.removeQueries({ queryKey: [queryKey, id] });

        return { previousData };
      },

      onError: (err, id, context) => {
        queryClient.setQueryData([queryKey], context?.previousData);
      },

      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  };

  return {
    useAll,
    useOne,
    useAdd,
    useUpdate,
    useRemove,
  };
};
```

And a simple example of how that could be used. In a real world app this would
have better error handling and stale states for mutations and queries.

```ts
const hooks = {
  todos: createHooks('/todos'),
  users: createHooks('/users'),
  posts: createHooks('/posts'),
};

const TodoComponent = () => {
  const { data: todos, isLoading, error } = hooks.todos.useAll();
  const addTodo = hooks.todos.useAdd();
  const updateTodo = hooks.todos.useUpdate();
  const removeTodo = hooks.todos.useRemove();

  const handleAddTodo = () => {
    addTodo.mutate({ text: 'New todo', completed: false });
  };

  const handleUpdateTodo = (id: string) => {
    updateTodo.mutate({ id, completed: true });
  };

  const handleRemoveTodo = (id: string) => {
    removeTodo.mutate(id);
  };

  if (error) return <div>Error: {error.message}</div>;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleAddTodo}>Add Todo</button>
      {todos?.map((todo: any) => (
        <div key={todo.id}>
          <span>{todo.text}</span>
          <button onClick={() => handleUpdateTodo(todo.id)}>Complete</button>
          <button onClick={() => handleRemoveTodo(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

You might be thinking, isn't this exactly the same as the first example? And you're right.
Except for one key difference. This usage didn't require extra code to duplicate this
caching logic for todos, users and posts! Not only do we help to limit the possible bug surface,
it also made it easier to adjust the way we expect our server to be structured easier.
If the server becomes [GraphQL](https://graphql.org/) or [tRPC](https://trpc.io/) it would be easy
enough to swap out the implementation of `createHooks` and the codebase would generally keep working.

It can be quite lucrative for maintainability of large codebases, as well as assisting in the speed of
development, to encode as many of your architectural conventions into code as possible. That's the
power of abstraction - when done right, it lets us create reusable patterns that scale across our entire application.

When we reflect back on how local first apps work, any of the apps I listed at the start all
have abstracted data fetching patterns, like [Linear's sync engine](https://www.youtube.com/watch?v=Wo2m3jaJixU).
Whilst many new apps are rushing to adopt local first as a way to get some of the benefits of these apps
I think we should be looking closer to home at our existing data models, and considering how to better abstract and
optimize the data fetching patterns we already have.

The key insight here isn't necessarily that we need to adopt fully local-first architectures,
but rather that we can achieve many of the same user experience benefits by thoughtfully abstracting.
The real power comes from consistency.
