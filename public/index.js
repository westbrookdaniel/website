// @ts-check
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

/** @type {import("htmx.org").default} */
const htmx = window.htmx;

const slugs = [
  "abstractions-and-simplicity",
  "audit-react-performance",
  "build-more-yourself",
  "building-effective-ai-agents",
  "client-file-based-router",
  "languages-server-frameworks",
  "local-first-style-data-caching",
  "nextjs-10-1-update",
  "react-abort-controllers",
  "react-server-components-revolution",
  "shadcn-and-v0",
  "start-any-project-with-vite",
  "svelte-vs-react-compiled",
  "tailwindcss-jit",
  "valtio-brings-vue-to-react",
  "website-upgrade",
];

htmx.onLoad(async () => {
  document.querySelector("#lucky")?.addEventListener("click", () => {
    const randomSlug = slugs[Math.floor(Math.random() * slugs.length)];
    window.location.href = `/blog/${randomSlug}`;
  });
});
