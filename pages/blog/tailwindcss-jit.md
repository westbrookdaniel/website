---
title: "Compile CSS classes on demand with Tailwind CSS JIT mode"
description: "The new on demand compiler for Tailwind CSS"
date: "2021-04-26T01:34:02.151Z"
snippet: "Recently Tailwind CSS has added an experimental new compiler that you can use to generate its classes. If you aren't familiar with how Tailwind works traditionally, here's the summary; based on the options you provide in a tailwind.config.js file, on build time..."
tags: post
layout: layouts/post.njk
---

Recently Tailwind CSS has added an experimental new compiler that you can use to generate its classes.
If you aren't familiar with how Tailwind works traditionally, here's the summary; based on the options you provide
in a `tailwind.config.js` file, on build time Tailwind will create all the necessary classes for your code. Then, when
building for production, it will remove any unused classes with [PurgeCSS](https://purgecss.com/).

The new Just-In-Time mode now uses this same method to create instead of remove classes. This has amazing benefits
for Tailwind like a reduced build time in development and production, as well as allowing for the stacking of variants. Althoughm I think a more interesting usage
is the creation of arbitrary classes. Let's go through an example of where this would be
useful.

Say I'm creating a series of social media icons on my website using SVGs, where I want each icon to be its brand colours.
There's a couple of ways this could be done normally. _(I'll be using React for this example but the same applies to HTML or any other framework)_

You could use inline styles:

```jsx showLineNumbers={false}
<Twitter style={{ color: "#00acee" }} />
```

Or an external stylesheet:

```css
/* styles.css */
.twitter-color {
  color: #00acee;
}
```

```jsx showLineNumbers={false}
<Twitter className="twitter-color" />
```

Or you could even add the colour to your Tailwind theme:

```js
// tailwind.config.js
module.exports = {
  /* ... */
  colors: {
    twitter: "#00acee",
  },
  /* ... */
};
```

```jsx showLineNumbers={false}
<Twitter className="text-twitter" />
```

While these solutions work, they're not ideal. There may be other circumstances in your
code where you might need to position a background image or set the height of navigation, and writing
a precise pixel value in your usual Tailwind styles would be the easiest way.

That's where Just-In-Time mode comes in:

```jsx showLineNumbers={false}
<Twitter className="text-[#00acee]" />
```

By putting any value in square brackets, the just in time compiler will create a new class on the fly
using this value. To use it you need to be using Tailwind CSS 2.1 or later and then you
can add `mode: 'jit'` to your config file, as well as ensuring you have the `purge` option setup.

You can read more about this feature in [Tailwind's documentation](https://tailwindcss.com/docs/just-in-time-mode#enabling-jit-mode).
