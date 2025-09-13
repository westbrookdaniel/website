import { formatDate } from "../lib/time";
import { html } from "../lib/html";
import type { PostData } from "../lib/types";

export function Post(post: PostData) {
  return html`<a href="/blog/${post.page.fileSlug}" preload="mouseover" class="block space-y-1 hover:bg-zinc-800 transition-colors duration-100 px-3 py-2 rounded-lg -mx-3">
  <p class="underline font-medium block">${post.data.title}</p>
  <div class="flex w-full justify-between text-zinc-500">
    <p class="hidden sm:block">${post.data.description}</>
    <p class="align-right">${formatDate(post.data.date)}</p>
  </div>
</a>`;
}
