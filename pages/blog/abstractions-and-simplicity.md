---
title: "Abstractions, the Enemy of Simplicity"
description: "It's a  double edged sword"
date: "2024-03-01T00:00:00.000Z"
snippet: "Over my time developing web apps, I've built a lot of abstractions. Abstractions for S3, abstractions for Tables, abstractions for Forms, etc. As I widen my horizons by exploring new languages (mainly Rust and Go)..."
tags: post
layout: layouts/post.njk
---

Over my time developing web apps, I've built a lot of abstractions. Abstractions for S3, abstractions for tables, abstractions for forms, etc. As I widen my horizons by exploring new languages (mainly [Rust](https://www.rust-lang.org/) and [Go](https://go.dev/)) I've become more familiar with their differing methodologies. The biggest take away I've had is in the React world abstractions are reached for too often, and it's making the ecosystem more complicated than it needs to be.

## What's too complicated?

In the new age of meta frameworks like [Next.js](https://nextjs.org/), the default choice for a web app has a lot of unnecessary complexity. You could argue "I'll need it eventually" but this same methodology is what leads to premature abstractions that needlessly complicate and slow down development time.

What about [Express.js](https://expressjs.com/)? A simple abstraction, similar to what's been developed for Go's standard library, or Rust's ecosystem, and battle tested. They don't even use JSX! An abstraction all too familiar to React, or it's similar equivalents in Vue, Svelte, etc. But in templates in Express are all the rage, and it works? _When_ you need more intractivty you can write vanilla javascript or add [HTMX](https://htmx.org/). _When_ you need to fit more javascript in one file you can reach for compression tools.
_When_ you need typscript's linting you can reach for it.

## The Abstraction Trap

The problem with reaching for abstractions too soon is that they can:

- Confuse beginners: Instead of learning the fundamentals, they're grappling with complex abstractions.
- Hurt performance: Abstractions can add unnecessary layers, slowing things down.
- Hinder debugging: When things go wrong, it's harder to understand the root cause buried under layers of abstraction.

Some easy things to consider that help me are:

- Master the Basics First: Don't drown in fancy abstractions before understanding the core concepts. It's like jumping into the deep end without learning to swim.
- Choose Wisely: Opt for well-documented and easy-to-learn abstractions that solve specific problems. Look for targeted tools, not Swiss Army knives unless you need _every_ tool in their toolbelt.
- Use Judiciously: Deploy abstractions only when they offer a clear advantage and don't add unnecessary complexity. Remember, simpler is often better.

## Ship Faster

The best thing about dropping the abstractions is you don't ship slower. Start writing your application and if you find yourself do something too repetitive stop and think. If I was to abstract this; would it be faster to ship what I need to do now if I didn't waste time writing an abstraciton and just did it. After shipping, reconsider any complexities of your project whilst time is your friend. This also helps to avoid premature abstractions and have a clearer understanding of the problem.

Strive for clean, efficient, and understandable code. Don't get caught up in the excitement of writing an abstraction; use that energy to ship outcomes instead. These are just my thoughts I've collected from my time working so if you have an differing opinions reach out, I'd love to know why.
