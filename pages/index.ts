import { RightIcon } from "../components/icons/right";
import { Layout } from "../components/layouts/main";
import { Post } from "../components/post";
import { html } from "../lib/html";
import { Meta, PostData } from "../lib/types";

const meta: Meta = {
  title: "Daniel Westbrook - Web Developer",
};

export default function Page(posts: PostData[]) {
  const content = html`<div class="side-p mb-48">
      <div class="flex gap-[4px]">
        <h1
          class="min-h-[32px] text-orange-400/90 font-heading text-2xl mb-4"
        ></h1>
        <div
          id="cursor"
          class="border-b-2 border-orange-400/90 mt-[4px] h-[24px] w-[18px]"
        ></div>
      </div>
      <p class="font-heading text-2xl text-balance">
        is currently developing at
        <a
          class="hover:underline decoration-zinc-700"
          target="_blank"
          href="https://www.glxdigital.com/"
          >GLX Digital</a
        >
        with other projects available on
        <a
          class="hover:underline decoration-zinc-700"
          target="_blank"
          href="https://github.com/westbrookdaniel/"
          >GitHub</a
        >
      </p>
    </div>

    <div class="side-p mb-48 flex w-full flex gap-4 flex-col">
      <p class="text-zinc-500 mb-4 text-balance max-w-[60ch]">
        These are some projects I've built recently, from full stack web
        development to small experimental libraries and tools.
      </p>

      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full xl:-ml-16"
      >
        <a
          href="https://github.com/westbrookdaniel/agent"
          target="_blank"
          class="pill new"
        >
          <code>danai.nvim</code> <span>New</span>
          <p>AI plugin for Neovim</p>
        </a>
        <a
          href="https://github.com/westbrookdaniel/json-cms"
          target="_blank"
          class="pill"
        >
          <code>json-cms</code>
          <p>Inline Editable CMS powered by JSON</p>
        </a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
        <a
          href="https://github.com/westbrookdaniel/graphql-sandbox"
          target="_blank"
          class="pill"
        >
          <code>graphql-sandbox</code>
          <p>GraphiQL but executes JS with workers</p>
        </a>
        <a
          href="https://github.com/westbrookdaniel/chat"
          target="_blank"
          class="pill"
        >
          <code>chat</code>
          <p>Flexible and fast AI chat app</p>
        </a>
      </div>
    </div>

    <div class="side-p space-y-8">
      <div class="flex w-full justify-between">
        <h2 class="font-heading text-2xl text-balance">Latest</h2>
        <a href="/blog" preload="mouseover" class="button active icon-button">
          See All ${RightIcon()}
        </a>
      </div>

      <ul>
        ${posts
          .sort(
            (a, b) =>
              new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
          )
          .slice(0, 3)
          .map((post) => Post(post))
          .join("")}
      </ul>
    </div>`;

  return Layout(meta, content, "/");
}
