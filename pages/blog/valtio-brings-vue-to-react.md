---
title: "Valtio Brings Vue's State to React"
description: "Be more flexible about where you use state"
date: "2021-10-16T01:22:51.335Z"
snippet: "What's great about Vue is that it has a very simple way to manage state. One of the best things about Vue's state is it doesn't have the same restrictions as hooks. For example, the below code is invalid in React because hooks must be used..."
tags: post
layout: layouts/post.njk
---

What's great about Vue is that it has a very simple way to manage state. One of the best things about Vue's
state is it doesn't have the same restrictions as hooks. For example, the below code is invalid in
React because hooks must be used inside of a functional component.

```jsx
const [count, setCount] = useState(0);

export default function Component() {
  return <div>{count}</div>;
}
```

In Vue, you don't need to worry about where you create refs, you even import one from another file
and Vue won't care.

```js showLineNumbers={false}
const count = ref(0);
```

In React, you generally want to use
[component composition](https://reactjs.org/docs/composition-vs-inheritance.html) first to avoid
the above problem. Although, this can not always be avoided. The default way of solving this is `useContext`.
This is an example from the [react docs](https://reactjs.org/docs/hooks-reference.html#usecontext)
on how to use context:

```jsx
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee",
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222",
  },
};

const ThemeContext = React.createContext(themes.light);

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```

And here is the same example but with Valtio, a new state management tool from pmndrs:

```jsx
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee",
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222",
  },
};

const theme = proxy(themes.dark);

function App() {
  return <Toolbar />;
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const snap = useSnapshot(theme);
  return (
    <button style={{ background: snap.background, color: snap.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```

Valtio gives us some tools to manage state in ways similar to Vue. In the example above, we create
state through the use of `proxy` and then access it on our component with `useSnapshot`. You'll notice
that there is no need to wrap our component in a `ThemeContext.Provider`, everything just works.

You may be wondering how you would go about changing the theme in this example. This is where Valtio shines,
because it allows you make any changes (including mutations) just like you would in vanilla javascript.

```jsx
const theme = proxy(themes.dark);

function setLightTheme() {
  theme.background = themes.light.background;
  theme.foreground = themes.light.foreground;
}
```

Or simplified further when taking into account that Valtio only updates your React component
when _only the state you accessed changes_. We can utilize this to simplify the code for updating the theme,
without having to worry about the impact of extra re-renders.

```jsx
const theme = proxy({
  ...themes,
  current: themes.dark,
});

function setLightTheme() {
  theme.current = theme.light;
}
```

The flexibility of Valtio makes it very useful, but it's important to note that Valtio is not a replacement for
`useState`. This is only necessary for state that is shared across components. I would recommend you
visit [Valtio's Github Page](https://github.com/pmndrs/valtio) to see all the features of Valtio and check out
the other awesome packages from pmndrs like [react-three-fibre](https://github.com/pmndrs/react-three-fiber). If you've used Valtio before, I would love to know what your experiences are and if you'd recommend it.
