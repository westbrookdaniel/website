import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  rmSync,
} from "node:fs";
import { dirname, basename } from "node:path";
import type { PostData } from "./lib/types";

// Parse frontmatter from markdown files
function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) throw new Error("No frontmatter found");

  const frontmatterText = match[1];
  const markdownContent = match[2];

  // Simple YAML parser for frontmatter
  const frontmatter: any = {};
  frontmatterText.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      const value = valueParts.join(":").trim();
      // Remove quotes if present
      frontmatter[key.trim()] = value.replace(/^["']|["']$/g, "");
    }
  });

  return { frontmatter, content: markdownContent };
}

// Load and parse blog posts
function loadBlogPosts(): PostData[] {
  const blogFiles = new Bun.Glob("pages/blog/*.md");
  const posts: PostData[] = [];

  for (const file of blogFiles.scanSync()) {
    try {
      const content = readFileSync(file, "utf-8");
      const { frontmatter, content: markdownContent } =
        parseFrontmatter(content);
      const fileSlug = basename(file, ".md");

      posts.push({
        page: { fileSlug },
        data: {
          title: frontmatter.title || "",
          description: frontmatter.description || "",
          date: frontmatter.date || "",
          snippet: frontmatter.snippet,
          tags: frontmatter.tags,
        },
        content: markdownContent,
      });
    } catch (error) {
      console.error(`Error parsing ${file}:`, error);
    }
  }

  return posts;
}

// Build system
async function build() {
  console.log("Building website...");

  if (existsSync("_site")) rmSync("_site", { recursive: true, force: true });
  mkdirSync("_site", { recursive: true });

  // Load blog posts
  const blogPosts = loadBlogPosts();
  console.log(`Loaded ${blogPosts.length} blog posts`);

  // Import page modules
  const { default: IndexPage } = await import("./pages/index.js");
  const { default: BlogPage } = await import("./pages/blog.js");
  const { default: NotFoundPage } = await import("./pages/404.js");
  const { default: PostPage } = await import("./pages/blog/[slug].js");

  // Copy public assets
  console.log("Copying public assets...");
  const publicFiles = new Bun.Glob("public/**/*");
  for (const file of publicFiles.scanSync()) {
    const destPath = file.replace("public/", "_site/public/");
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
    writeFileSync(destPath, readFileSync(file));
  }

  // Build index page
  console.log("Building index page...");
  const indexHtml = IndexPage(blogPosts);
  writeFileSync("_site/index.html", indexHtml);

  // Build blog listing page
  console.log("Building blog page...");
  const blogHtml = BlogPage(blogPosts);
  if (!existsSync("_site/blog")) {
    mkdirSync("_site/blog", { recursive: true });
  }
  writeFileSync("_site/blog/index.html", blogHtml);

  // Build 404 page
  console.log("Building 404 page...");
  const notFoundHtml = NotFoundPage();
  writeFileSync("_site/404.html", notFoundHtml);

  // Build individual blog posts
  console.log("Building blog posts...");
  await Promise.all(
    blogPosts.map(async (post) => {
      const postHtml = await PostPage(post);
      const postDir = `_site/blog/${post.page.fileSlug}`;
      if (!existsSync(postDir)) mkdirSync(postDir, { recursive: true });
      writeFileSync(`${postDir}/index.html`, postHtml);
    }),
  );

  console.log("Build complete!");
}

build();
