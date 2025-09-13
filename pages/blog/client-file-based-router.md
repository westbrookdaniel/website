---
title: "Client Side File-Based Router"
description: "See how you can use a file-based router in your client side projects"
date: "2021-08-01T07:50:15.996Z"
snippet: "Nextjs and other server-side frameworks have a great feature that makes adding new pages in your web app very continent, referred to as a file-based router. Usually, within a `pages` folder..."
tags: post
layout: layouts/post.njk
---

Nextjs and other server-side frameworks have a great feature that makes adding new pages in your web app very continent, referred to as a file-based router. Usually, within a `pages` folder, you can add React component files and they will automatically be converted into routes in your app, with features like dynamic routes and 404 pages still working based on the name of the file.

```jsx
// pages/about.js
const About = () => {
	return <h1>About Page</div>
}
// pages/index.js
const Home = () => {
	return <h1>Home Page</div>
}
```

In this example, `pages/index.js` would be rendered for route `/` and `pages/about.js` for the route `/about`.

## Glob Magic

What if I told you that you didn't need a server-side application to pull this off thanks to the power of tools like Vite and Webpack. Both of these contain a method of importing all of the files from the directory in the form of [Vite's glob imports](https://vitejs.dev/guide/features.html#glob-import) and Webpack Context API (not to be confused with [React's context API](https://reactjs.org/docs/context.html)).

To save you time, I've created an example project that utilities Vite's glob import to have a file-based router that not only provides the complete routing capabilities of `react-router-dom`, but also provides more benefits.

## Improvements

The quality of life improvements I've included in this project are:

- Ignoring inline test files
- Pages being able to provide information to the router
- Being able to easily wrap every route

In the past, I've found one of the biggest problems with file-based routers is the difficulty in testing. Many (like Nextjs) don't ignore tests sitting alongside routes which makes it difficult to maintain a consistent place to put test files. By changing the glob to ignore test files I was able to make this minor quality of life improvement.

Data can be provided back to the router via a `RouteData` export like this:

```jsx
export const data = {
  name: "Home",
  handlesOwnRouting: true,
};
```

Since you can import a list of all routes, this can be useful for providing names to important routes for use in analytic or automatically generated navigation. One other property I have implemented is `handlesOwnRouting` which allows a component to provide its own routing without being directed to the 404 route.

As for wrapping every route, it might not initially seem useful since you could just wrap the router itself, but since we're providing a lot of useful information about the route itself it is the perfect place for authentication based route protection to be added.

## Try it Out

Do you like or have you ever used file-based routers? You're welcome to give mine a try by visiting the repository [file-based-router-example](https://github.com/westbrookdaniel/file-based-router-example). If you want to see me convert this into an NPM package or share the Webpack based example you can contact me through Twitter or email.
