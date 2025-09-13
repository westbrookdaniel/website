---
title: "Nextjs 10.1 Development Improvements"
description: "Learn about the latest updates to next/image and other improvements"
date: "2021-04-17T09:14:02.693Z"
snippet: "Nextjs just got it's most recent update - 10.1 - which brings a lot of new exciting features. Some highlights include: 3x faster refresh, Reduced install time/size, next/image Improvements, Custom 500 page, Initial Webpack 5 support."
tags: post
layout: layouts/post.njk
---

Nextjs just got its most recent update - 10.1 - which brings a lot of new exciting features. Some highlights include:

- 3x faster refresh
- Reduced install time/size
- `next/image` Improvements
- Custom 500 page
- Initial Webpack 5 support

I want to go deeper into the changes to `next/image` because I think these
improvements do a great job at improving the development experience of Nextjs.

## What is `next/image`?

Introduced back in 10.0, `next/image` is a "drop-in replacement" for the img tag (except width and height are now required).

```jsx
import Image from 'next/image'

<Image src="/profile-picture.jpg" width="400" height="400" alt="Profile Picture">
```

It provides automatic image optimization through resizing, reducing quality, lazy loading, and changing file format. It also can do this based on your device
screen size to serve smaller images for mobile. This is all done automatically with Vercel, or you can provide your own [custom loaders](https://nextjs.org/docs/api-reference/next/image#loader).

## Now in built in WebAssembly

To get `next/image` working, it used to use a native dependency which leads to a big
install size, almost 50% being just native dependencies. With 10.1, Nextjs now uses WebAssembly
for this, reducing install size by ~30MB as well as adding support for Apple Silicon M1 MacBooks.
There are even more improvements possible in the future because of this move thanks to SIMD extensions and multi-threading.

## Did I mention development is faster?

Previously the development flow in Nextjs using `next/image` would go like this; add your big high-resolution
image to your repo and use it. In production, this would automatically get optimised, _but_ locally when using
`next dev` and `next start` these optimisations wouldn't be applied, leaving your browser
to struggle to load 10mb's of unoptimised images which would normally be handled perfectly in production.

Now, could I have just optimised my images like everyone else? I say where's the fun in that!
But thanks to the move to WebAssembly we are now able to get these optimisations when using `next dev`
and `next start` locally.

Between this improvement, 3x faster refreshing, and speed increases when using Webpack 5,
this update has been an awesome look at the direction Nextjs is heading.

You can see more in [Nextjs' blog post](https://nextjs.org/blog/next-10-1)
