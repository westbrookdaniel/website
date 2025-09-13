import { html } from "../../lib/html";
import { Meta } from "../../lib/types";
import { Head } from "../head";
import { Header } from "../header";
import { Footer } from "../footer";
import { LeftIcon } from "../icons/left";
import { formatDate, readingTime } from "../../lib/time";

export function PostLayout(meta: Meta, content: string, postData: any) {
  return html`<!doctype html>
    <html lang="en">
      <head>
        ${Head()}
        <title>${postData.data.title} - Daniel Westbrook</title>
      </head>
      <body hx-boost="true">
        ${Header("/blog")}

        <main class="pt-24 pb-32 relative max-w-[90ch] mx-auto flex-1 w-full">
          <div class="side-p mb-48">
            <h1 class="min-h-[32px] font-heading text-balance text-2xl mb-4">
              ${postData.data.title}
            </h1>
            <p class="text-zinc-500 text-balance max-w-[60ch] mb-1">
              ${postData.data.description}
            </p>
            <div class="flex gap-4">
              <p class="text-zinc-500">${formatDate(postData.data.date)}</p>
              <p class="text-zinc-500">${readingTime(postData.content)}</p>
            </div>
          </div>

          <div class="side-p space-y-8">
            <div class="prose prose-zinc prose-invert max-w-[80ch]">${content}</div>
          </div>

          <div class="side-p flex justify-start mt-20">
            <a class="button active" href="/blog"> ${LeftIcon()} All Posts </a>
          </div>
        </main>

        ${Footer()}
      </body>
    </html>`;
}

