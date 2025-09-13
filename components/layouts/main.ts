import { html } from "../../lib/html";
import { Meta } from "../../lib/types";
import { Head } from "../head";
import { Header } from "../header";
import { Footer } from "../footer";

export function Layout(meta: Meta, content: string, currentPath: string = '') {
  return html`<!doctype html>
    <html lang="en">
      <head>
        ${Head()}
        <title>${meta.title}</title>
      </head>
      <body hx-boost="true">
        ${Header(currentPath)}

        <main class="pt-24 pb-32 relative max-w-[90ch] mx-auto flex-1 w-full">
          ${content}
        </main>

        ${Footer()}
      </body>
    </html>`;
}
