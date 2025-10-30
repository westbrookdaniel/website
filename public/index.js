// @ts-check
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

/** @type {import("htmx.org").default} */
const htmx = window.htmx;

const charTypeSpeeds = [200, 100, 150, 90, 80, 75, 160, 180, 170, 110, 80, 75, 70, 70, 70];

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

  if (window.location.pathname !== "/") return;

  const h1 = document.querySelector("h1");
  const is = document.querySelector("#is");
  const place = document.querySelector("#place");
  const wit = document.querySelector("#with");
  const source = document.querySelector("#source");

  typeElement(h1);
  setTimeout(async () => {
    await typeElement(is);
    setTimeout(async () => {
      typeElement(place);
      await typeElement(wit);
      typeElement(source);
    }, 500);
  });
});

/** @type {WeakMap<HTMLElement, NodeJS.Timeout>} */
let timeouts = new WeakMap();

/** @param {HTMLElement} el */
async function typeElement(el) {
  const current = timeouts.get(el);
  if (current) clearTimeout(current);

  const chars = smartSplit(el.ariaLabel ?? "");
  el.innerText = "";

  return new Promise((resolve) => {
    const next = setTimeout(() => {
      function type() {
        const charIndex = el.innerText.length % charTypeSpeeds.length;

        return setTimeout(() => {
          el.innerText += chars.shift();
          if (chars.length === 0) resolve();
          else type();
        }, charTypeSpeeds[charIndex] / 1.5);
      }
      timeouts.set(el, type());
    }, 200);

    timeouts.set(el, next);
  });
}

function smartSplit(str) {
  let s = "";
  return str.split("").reduce((acc, c) => {
    if (c.trim() === "") s = c;
    else acc.push(s + c) && (s = "");
    return acc;
  }, []);
}
