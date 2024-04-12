---
title: "Using AbortControllers to Cancel Fetch in React"
description: "How to use the web api to cancel fetch easily"
date: "2021-04-12T12:29:28.834Z"
snippet: "In react we can use fetch in a useEffect to get a request when the page loads... This uses the web api AbortController as the signal for fetch. By returning a function from useEffect we can trigger the abort controller on dismount..."
tags: post
layout: layouts/post.njk
---

In React we can use fetch in a `useEffect` hook to make a request when the page loads. So why is the code below problematic?

```jsx
const Example = () => {
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts/1")
      .then((res) => res.json())
      .then((json) => setMessage(json.title))
      .catch((error) => console.error(error.message));
  }, []);
  return <div>{message}</div>;
};
```

If we unmount the component while this fetch is in process we will get the following error.

```md showLineNumbers={false}
Warning: Can't perform a React state update on an unmounted component.
This is a no-op, but it indicates a memory leak in your application.
To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount
method.
```

What does this mean? `update on an unmounted component` summarizes it well. We are trying to change
the state of a component that no longer exists, because it was removed. This can lead to our app
breaking in weird ways, as well as wasting resources on unnecessary actions.
So let's fix it by canceling the fetch.

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch("https://jsonplaceholder.typicode.com/posts/1", {
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then((json) => setMessage(json.title))
    .catch((error) => console.error(error.message));

  return () => controller.abort();
}, []);
```

Here we use the web api `AbortController` as the signal for fetch. By returning a function from `useEffect` we
can trigger the abort controller on dismount (see the React [docs](https://reactjs.org/docs/hooks-effect.html#example-using-hooks-1)).
The `AbortSignal` (`controller.signal`) is then passed into the fetch as an argument and voilà!

Although, there is a problem with this solution. When the component is unmounted while a fetch call is in progress, this
message is logged to the console:

```md showLineNumbers={false}
The user aborted a request.
```

This happens because aborting the fetch doesn't magically delete the promise, so it fails with an
`AbortError` which is getting logged in `catch`.

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch("https://jsonplaceholder.typicode.com/posts/1", {
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then((json) => setMessage(json.title))
    .catch((error) => {
      if (error.name !== "AbortError") {
        console.error(error.message);
      }
    });

  return () => controller.abort();
}, []);
```

By ignoring the error if it has the name `AbortError`, we've solved the problem! You can read
more about `AbortController` on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
You can also see its browser support on [caniuse](https://caniuse.com/abortcontroller).

Jumping back to the code, this request this still doesn't expose a loading state or indicate to the ui if it has failed.
If you don't want to deal with all of this, you're probably better off just using
[`react-query`](https://react-query.tanstack.com/) instead (which also does it in a lot less code).

```jsx
const { data, isLoading /* etc... */ } = useQuery("title", () =>
  fetch("https://jsonplaceholder.typicode.com/posts/1")
    .then((res) => res.json())
    .then((res) => res.title),
);
```

How much easier is that! You can find an example of all of these methods implemented on
[CodeSandbox](https://codesandbox.io/s/mutable-pine-psldb?file=/src/Comp.js).
