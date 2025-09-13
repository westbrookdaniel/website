import { Layout } from "../components/layouts/main";
import { Post } from "../components/post";
import { html } from "../lib/html";
import { Meta, PostData } from "../lib/types";

const meta: Meta = {
  title: "Blog - Daniel Westbrook",
};

export default function BlogPage(posts: PostData[]) {
  const content = html`<div class="side-p mb-48">
      <h1 class="min-h-[32px] font-heading text-2xl mb-4">My Posts</h1>
      <p class="text-zinc-500 text-balance max-w-[60ch]">
        I don't write about everything, but what I do write about interests me.
        Not all of these opinions are up to date.
      </p>
    </div>
    <div class="side-p space-y-8">
      <h2 class="font-heading text-2xl text-balance">Latest</h2>

      <ul>
        ${posts
          .sort(
            (a, b) =>
              new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
          )
          .map((post) => Post(post))
          .join("")}
      </ul>
    </div>`;

  return Layout(meta, content, "/blog");
}

