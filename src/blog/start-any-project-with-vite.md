---
title: "Start Any Project With Vite"
description: "Explore a new, fast, and easy to use build tool"
date: "2021-06-18T11:35:39.854Z"
snippet: "Recently I've been using Vite (pronounced /vit/) when starting up my new projects, specifically Vite 2.0. Vite is a easy to use build tool like Create React App but supports many libraries and frameworks, with the below templates in Javascript and Typescript..."
tags: post
layout: layouts/post.njk
---

Recently I've been using Vite (pronounced `/vit/`) when starting up my new projects,
specifically Vite 2.0. Vite is an easy to use build tool like Create React App but
supports many libraries and frameworks, with the below templates in Javascript and
Typescript:

- Vanilla
- Vue
- React
- Preact
- Lit-element
- Svelte

## Development

It provides a much faster local development experience as usual, due to its utilisation of native ES modules
and [esbuild](https://esbuild.github.io/). Esbuild is an extremely fast bundler written in Go which is 10-100x
faster than other bundlers. This leads to a start-up time of 100ms and hot module reloading of under 50ms. Vite
also supports React's fast refresh through its plugin system via [`@vitejs/plugin-react-refresh`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy).

## It's All Supported

Typescript (`.ts` and `.tsx`) files are also supported out of the box with no configuration. The only caveat
being JSX can only be used in `.tsx` and `.jsx` files - not `.js` out of the box. So are CSS Modules by just
importing a `.module.css` file, and image files of course. All you need to do to get CSS Pre-processors like
Sass and Less working is to install the packages::

```bash showLineNumbers={false}
# .scss and .sass
npm install -D sass

# .less
npm install -D less
```

It even supports the loading of Web Workers and Web Assembly out of the box:

```js
// Web Workers
import Worker from "./worker.js?worker";

const worker = new MyWorker();

// Web Assembly
import init from "./example.wasm";

init().then((exports) => {
  exports.test();
});
```

If you want to learn more about what's supported, checkout [Vite's guide](https://vitejs.dev/guide/).

## Production

In production, Vite uses pre-configured Rollup which uses native ESModules. Although, if you want to support
older browsers like IE11 you can do so by just including the official
[`@vitejs/plugin-legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy). This plugin also
includes these polyfills if the browser requires them, allowing everyone to get the best experience regardless of the platform.

## Easy to Use

Most importantly, Vite is quick to set up and use with everything just working. Because of how fast local
development is, I have found it to be a lot quicker (and more fun) to try out a new package in Vite when
compared to Create React App, or even Nextjs when its features aren't needed.

If you want to try it out you can get started with the CLI by typing `npm init @vitejs/app` or
`yarn create @vitejs/app`, and be sure to let me know what you think.
