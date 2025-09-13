import { html } from "../lib/html";
import { EmailIcon } from "./icons/email";
import { LinkedinIcon } from "./icons/linkedin";
import { GithubIcon } from "./icons/github";
import { XIcon } from "./icons/x.com";

export function Footer() {
  return html`<footer
    class="pb-6 sm:pb-8 lg:pb-16 pt-16 relative max-w-[90ch] mx-auto w-full"
  >
    <div class="side-p w-full flex justify-between items-end">
      <div class="flex gap-3">
        <a href="mailto:westy12dan@gmail.com" aria-label="Email">
          ${EmailIcon()}
        </a>
        <a
          href="https://www.linkedin.com/in/daniel-westbrook-692227196/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          ${LinkedinIcon()}
        </a>
        <a
          href="https://github.com/westbrookdaniel/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Github"
        >
          ${GithubIcon()}
        </a>
        <a
          href="https://x.com/DanielW29381255"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="x.com"
        >
          ${XIcon()}
        </a>
      </div>
      <p class="text-zinc-500 text-sm">v2025.6.2</p>
    </div>
  </footer>`;
}

