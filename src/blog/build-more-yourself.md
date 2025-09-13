---
title: "Build more yourself"
description: "Minimizing dependencies in modern web projects"
date: "2025-09-13T00:00:00.000Z"
snippet: "Modern web Javascript projects love dependencies. Not many frontends today could be built without React, a server rendering framework like NextJS, form libraries like `react-hook-form`"
tags: post
layout: layouts/post.njk
---

Modern web Javascript projects love dependencies. Not many frontends today could be built without
React, a server rendering framework like NextJS, form libraries like `react-hook-form`,
etc. For backend projects ditching Express for a NodeJS http server is rare sight. But I believe
that we have pushed too far in the direction of pulling in every dependency, and it's leading
to worse performance, more bugs, and higher maintenance costs.

In Steph Ango's post from 2024 he writes about ["What can we remove?"](https://stephango.com/remove),
and how we trim and organise the real world should be reflected in the systems we build. Jonathan Blow's
talks and ideas over the years reflect a similar perspective. We don't want to keep adding more layers
of abstractions, because not only are we forgetting how to build simpler systems but we are paying
a performance cost of these layers implementations.

How I approach it is:

- Start with built-ins. Node, Bun, Go, Python—modern runtimes cover more than people realize.

- Follow the principles of [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) and [KISS](https://en.wikipedia.org/wiki/KISS_principle).

- Refactor your code. Don't add around it more to procrastinate having to.

- Don't follow patterns blindly. Impliment solutions to fix the problems you have.

Not all of these are compatible with existing projects or teams, but they can be good guiding principles
to follow. It's also okay to accept you aren't an expert in Cryptography, parsing, or database drivers.
But also don't doubt yourself. The best and most reliable systems are lean: minimal surface, clear structure,
and no hidden layers. You can understand them, trust them, and keep them fast.
