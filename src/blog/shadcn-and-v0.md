---
title: "Shadcn UI and v0 are keeping NextJS alive"
description: "NextJS is still the best app framework"
date: "2024-04-13T00:00:00.000Z"
snippet:
tags: post
layout: layouts/post.njk
---

I don't think it's a controversial take anymore to say NextJS is a bloated framework. As app router
continues to be notably slower than the pages router, turbopack's takeover slows, and React's vision
clashes with the popular views of the community on social medias like X. While I've looked for a long
time for an alternative (Express + HTMX comes close to offering the flexibility and robustness), thanks
to Vercel's investments in shadcn/ui and v0 have kept NextJS as the clear winner.

## NextJS is getting bloated

It wasn't very long ago where NextJS had a simple architecture, or at least a simple one to grasp.
As Vercel took on the vision of React in its holistic adoption of RSC it paid for being the early
adopter by losing its simplicity, succumbing to having to have its own set of documentation
and dealing with the controversial adoption of canary React.

While they have mostly recovered from this adoption, the slow speeds of RSC and complex mental model
have left big scars on the perception of the framework, leaving room for competitors like HTMX.

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

Thanks to these 2 projects, I think NextJS is currently the best framework for most app like websites.
It is unmistakable that with a template like the [prisma turborepo starter](https://github.com/vercel/turbo/tree/main/examples/with-prisma)
you can unthinkable MVP speeds by utilising v0 to build your initial views with shadcn/ui to power it all.
Also, you can't not mention the ease of use of turborepo which unlike its sister project turbo pack is incredibly well
looked after and I'd consider compelte for node based projects (I use it myself at my work at [GLX Digital](https://www.glxdigital.com/)).

Unfortunately over the years of perfecting this stack, Vercel has neglected static sites. I still consider
[Eleventy](https://www.11ty.dev/) as the best static site generator for it's simplicity and speed, but hopefully
one day Vercel will consider reinvesting in the concept possibly to compete with projects like [Astro](https://astro.build/).

In the meantime, have fun making use NextJS with shadcn/ui and v0 to build fast!
