import { html } from "../lib/html";

export function Header(currentPath: string = '') {
  const isHome = currentPath === '/';
  const isBlog = currentPath.startsWith('/blog') && currentPath !== '/';
  
  return html`<header class="pt-6 sm:pt-8 lg:pt-16 pb-16 relative max-w-[90ch] mx-auto w-full"> 
	<div class="side-p flex w-full">
		<nav class="flex gap-1 flex-1">
        	<a class="button${isHome ? ' active' : ''}" href="/" preload="mouseover">Home</a>
        	<a class="button${isBlog ? ' active' : ''}" href="/blog" preload="mouseover">Blog</a>
		</nav>
	</div>
</header>`;
}