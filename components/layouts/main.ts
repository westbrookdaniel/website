import { html } from "../../lib/html";
import { Meta } from "../../lib/types";

export function Layout(meta: Meta, content: string) {
  // TODO only partially converted
  return html`<!doctype html>
    <html lang="en">
      <head>
        {% include "head.njk" %}
        <title>${meta.title}</title>
      </head>
      <body hx-boost="true">
        {% include "header.njk" %}

        <main class="pt-24 pb-32 relative max-w-[90ch] mx-auto flex-1 w-full">
          ${content}
        </main>

        {% include "footer.njk" %}
      </body>
    </html>`;
}
