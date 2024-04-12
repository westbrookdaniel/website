---
title: "Svelte Vs React: Using Compiled Code"
description: "ASTs, Parsers, and how Svelte and React are using them"
date: "2023-11-04T00:00:00.000Z"
snippet: "Compiled JavaScript is at the forefront of modern web development, promising improved performance and smaller bundle sizes. One of the key concepts underlying these compiled frameworks/languages is..."
tags: post
layout: layouts/post.njk
---

Compiled JavaScript is at the forefront of modern web development, promising improved
performance and smaller bundle sizes. One of the key concepts underlying these compiled frameworks/languages is
the use of Abstract Syntax Trees (ASTs) to represent the structure of code in a
tree-like format. Understanding how ASTs work, along with the role of parsers, is crucial for diving
into how a framework like [Svelte](https://svelte.dev/) works.

## Abstract Syntax Trees (ASTs)

ASTs are the backbone of compiled JS frameworks/languages. They are data structures that break down code
into a hierarchical tree, providing a structured representation of its syntax. They allow developers to
analyze, manipulate, and optimize code efficiently, ultimately leading to improved runtime performance.
When compiling, optimisations can be made that can add functionality or memoisation in an optimial way.
You can see react exploring this in their [React Forget](https://www.youtube.com/watch?v=lGEMwh32soc) project.

## Parsers

To build ASTs, parsers are the gatekeepers. Parsers are responsible for transforming the source
code into a structured AST. These tools analyze and understand the code's structure, ensuring that
it adheres to the language's grammar rules, and covert it into a walkable tree. Some popular parsers are
[parse5](https://github.com/inikulin/parse5) for HTML and [acorn](https://github.com/acornjs/acorn) for JavaScript.

## The Role of Compilation in Svelte

Svelte is a prime example of a compiled language for web application development. During compilation,
Svelte takes your components and transforms them into highly optimized JavaScript code. Svelte is able minimize runtime overhead
and generate efficient code that's ready to run in the browser.

Compile-time transformations are a cornerstone of Svelte's efficiency. They enable Svelte to optimize
your code during compilation rather than at runtime, as well as add reactivity, scoped styles and many other features.
This approach results in faster load times and better performance, two essential goals for modern web framework or app.

## React's Transition Towards React Server Components (RSC)

React is also evolving, in its shift towards React Server Components (RSC). RSC introduces concepts
like "use server" and "use client" to optimize the rendering of components. These new directives are compile-time transformations,
that involve transforming the AST and/or compiling code to achieve a streamlined server-first approach to React development.

## The Future

With React's future in RSC and Svelte's growing popularity, it's quite clear that compiled code will be a more common occurance
for JS developers in the coming years. Although, it's still unclear how much of the burden will be on framework authors
to warrant ignoring how they work. If you want to dive deeper on how compiled frameworks like Svelte work,
I'd highly recommend the article from back in 2020 called [The Svelte compiler: How it works](https://dev.to/joshnuss/svelte-compiler-under-the-hood-4j20).
