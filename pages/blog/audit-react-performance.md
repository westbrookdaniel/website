---
title: "Auditing React Performance"
description: "How to use the React DevTools Profiler"
date: "2022-05-20T11:14:14.642Z"
snippet: "Finding what's making your react app slow can be hard, but hopefully, I can give provide some tools and places you can look to improve your performance with less hassle. There are three main tools I always use when debugging performance..."
tags: post
layout: layouts/post.njk
---

Finding what's making your react app slow can be hard, but hopefully, I can give provide
some tools and places you can look to improve your performance with less hassle. There
are three main tools I always use when debugging performance:

- React DevTools Profiler
- Chrome DevTools Performance Panel
- Lighthouse

Each are great at providing solving different problems - this post
covers how to use the React DevTools Profiler.

You probably already have the React DevTools installed, but if you don't you can
install it from the [chrome web store](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en).
Now you have Chrome DevTools installed let's get stuck into an example from my website.

## Ranked Chart

![Profiler Ranked Chart](/public/images/blog/audit-react-performance/profiler.png)

In the profiler, you can go through each render by using the arrows in the top right
(where it says 2 / 5). This particular view is called the Ranked chart.
Here I was looking at how changing pages are rendered for me, and I can use this view
to see what took the longest to render. I find the Ranked chart the most useful in
bloated components since it shows the components that took the longest to render at the top.

## Flamegraph Chart

The other view for a recording I use is the flamegraph:

![Profiler Flamegraph Chart](/public/images/blog/audit-react-performance/flamechart.png)

This shows the components in the order they were nested (for example `ProjectItems`
contains `Items`). What's useful about this view is it will gray out components that have skipped
rerendering, so you can identify which component is causing large sections of your app to
rerender, which can be harmful to performance if it happens frequently.

A common cause of this to watch out for is the [Context API](https://reactjs.org/docs/context.html).
If your context is updating frequently then you should probably just pass the state as props,
or use [zustand](https://github.com/pmndrs/zustand) (or even
[zustand/context](https://github.com/pmndrs/zustand#react-context)).

You can also use the `Highlight updates when components rerender` option in the React DevTools
settings to get a similar more visual version of this.

## What did you think?

Whilst the profiler can be very useful for tracking down what components are causing you
trouble rendering, but sometimes your issue isn't to do with rendering. Some of the other tools mentioned
can be better at solving those problems. If there was something you think I missed, let me know!
