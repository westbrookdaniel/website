let currentTimeout;
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

htmx.onLoad(() => {
  document.querySelector("#lucky")?.addEventListener("click", () => {
    const randomSlug = slugs[Math.floor(Math.random() * slugs.length)];
    window.location.href = `/blog/${randomSlug}`;
  });

  if (window.location.pathname !== "/") return;
  if (currentTimeout) clearTimeout(currentTimeout);

  let s = "";
  const chars = "Daniel Westbrook".split("").reduce((acc, c) => {
    if (c.trim() === "") s = c;
    else acc.push(s + c) && (s = "");
    return acc;
  }, []);

  const h = document.querySelector("h1");
  const c = document.querySelector("#cursor");

  h.innerText = "";

  currentTimeout = setTimeout(() => {
    function type() {
      const charIndex = h.innerText.length % charTypeSpeeds.length;
      setTimeout(() => {
        h.innerText += chars.shift();
        if (chars.length == 0) {
          setInterval(() => (c.hidden = !c.hidden), 700);
        } else {
          type();
        }
      }, charTypeSpeeds[charIndex]);
    }
    currentTimeout = type();
  }, 400);
});
