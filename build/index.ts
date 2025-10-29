import { copyPublicAssets, resetOutputDir, writeOutputFile } from "./fs";
import { buildTailwind } from "./tailwind";
import { createRenderer } from "./templates";
import { loadPosts } from "./posts";

async function build() {
  console.log("Building site...");
  resetOutputDir();

  const renderer = createRenderer();

  console.log("Copying public assets...");
  copyPublicAssets();

  console.log("Compiling Tailwind...");
  await buildTailwind();

  console.log("Loading posts...");
  const posts = await loadPosts();

  const latestPosts = posts.slice(0, 3);

  console.log("Rendering index page...");
  const indexContent = renderer.render("pages/index.html", { latestPosts });
  const indexHtml = renderer.render("components/layouts/main.html", {
    meta: { title: "Daniel Westbrook - Web Developer" },
    nav: { homeActive: true, blogActive: false },
    content: indexContent,
  });
  writeOutputFile("index.html", indexHtml);

  console.log("Rendering blog listing...");
  const blogContent = renderer.render("pages/blog.html", { posts });
  const blogHtml = renderer.render("components/layouts/main.html", {
    meta: { title: "Blog - Daniel Westbrook" },
    nav: { homeActive: false, blogActive: true },
    content: blogContent,
  });
  writeOutputFile("blog/index.html", blogHtml);

  console.log("Rendering 404 page...");
  const notFoundContent = renderer.render("pages/404.html", {});
  const notFoundHtml = renderer.render("components/layouts/main.html", {
    meta: { title: "Not Found - Daniel Westbrook" },
    nav: { homeActive: false, blogActive: false },
    content: notFoundContent,
  });
  writeOutputFile("404.html", notFoundHtml);

  console.log("Rendering individual blog posts...");
  for (const post of posts) {
    const postHtml = renderer.render("components/layouts/post.html", {
      nav: { homeActive: false, blogActive: true },
      post,
      content: post.html,
    });
    writeOutputFile(`blog/${post.page.fileSlug}/index.html`, postHtml);
  }

  console.log("Build complete!");
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
