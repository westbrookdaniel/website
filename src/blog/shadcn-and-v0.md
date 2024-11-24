---
title: "Using NextJS with Shadcn UI and v0"
description: "The power of NextJS comes from it's ecosystem"
date: "2024-04-13T00:00:00.000Z"
snippet: "It may no longer be considered controversial to view NextJS as a bloated framework. The app router has often been observed as notably slower than the pages router, in part due to ongoing development of React Server Components (RSC) and the extensive rewrite of NextJS’s internals."
tags: post
layout: layouts/post.njk
---

It may no longer be considered controversial to view NextJS as a bloated
framework. The app router has often been observed as notably slower than
the pages router, in part due to ongoing development of React Server
Components (RSC) and the extensive rewrite of NextJS’s internals by
Turbopack. While various alternatives have emerged to offer similar
flexibility and robustness—such as Express combined with HTMX—NextJS
remains a popular choice, largely due to Vercel's investments in
shadcn/ui and v0.

## NextJS

Not long ago, NextJS was praised for its relatively simple architecture,
or at least one that was straightforward to understand. However, Vercel’s
decision to embrace React’s vision of holistic RSC adoption brought
complexity at the cost of early adoption, requiring dedicated documentation
and necessitating adjustments to manage the controversial canary React
implementation. Though much of the initial difficulty has been addressed,
the persistent slow performance of RSC and the increasingly complex
mental model have impacted the framework’s perception, leaving room
for alternatives like HTMX to gain ground.

## shadcn/ui and v0

Into the picture steps shadcn/ui. A fresh ui framework which pitches components that give a "Vercel style" built
on top of the fast growing radix ui with a high level of polish and most notably, are copied into your repo
instead of npm installed. This fits perfectly into the build fast mentality of Vercel. I'm sure there is more
to the decision making that goes on under the hood but to an outsider it seems like the perfect fit for their
upcoming project v0.

v0 is an ambitious usage of AI to not only to generate UI's (something that ChatGPT can do with enough persistence),
but a creative component library driven by React interfaces that can be dropped into any NextJS project. While it was
a bit minimal at launch, as with all Vercel products they've stuck with it and developed an unmistakable productivity
win for developers.

## The Ideal App Project

Thanks to these 2 projects, I think NextJS (or any tool that can utilise them well) is currently the best framework for most app like websites.
It is unmistakable that with a template like the [prisma turborepo starter](https://github.com/vercel/turbo/tree/main/examples/with-prisma)
you can build an MVP at extreme speeds by utilising v0 to build your initial views with shadcn/ui to power it all.
Also, it's hard not to point out turborepo, which is a fantastic streamlined monorepo tool, which I
loved implementing and using at [GLX Digital](https://www.glxdigital.com/)).

Unfortunately over the years of perfecting this stack, Vercel has neglected static sites. I still consider
[Eleventy](https://www.11ty.dev/) as the best static site generator for it's simplicity and speed, although
I do have a soft spot for [Astro's](https://astro.build/) excellent implementation of islands.

It really goes to show that providing a strong ecosystem for your product can
make a strong impact on the core products perception. Maybe Vercel has been
taking notes from frameworks like Ruby on Rails.
