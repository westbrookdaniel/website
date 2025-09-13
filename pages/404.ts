import { Layout } from "../components/layouts/main";
import { LeftIcon } from "../components/icons/left";
import { html } from "../lib/html";
import { Meta } from "../lib/types";

const meta: Meta = {
  title: "Not Found - Daniel Westbrook",
};

export default function NotFoundPage() {
  const content = html`<div class="side-p">
	<h1 class="min-h-[32px] font-heading text-2xl mb-4">Not Found</h1>
  <p class="text-zinc-500 text-balance max-w-[60ch]">
    You seem to have stumbled upon a page that doesn't exist.
  </p>
</div>
<div class="side-p flex justify-start mt-20 mb-48">
  <a class="m-0 button active" href="/" preload="mouseover">
    ${LeftIcon()} Home
  </a>
</div>`;

  return Layout(meta, content, '/404');
}