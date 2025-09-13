import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname, extname, basename } from "path";
import { glob } from "glob";
import { marked } from "marked";

// Types
export type PostData = {
  page: {
    fileSlug: string;
  };
  data: {
    title: string;
    description: string;
    date: string;
    snippet?: string;
    tags?: string;
  };
  content: string;
};

export type Meta = {
  title: string;
};

// Utility functions
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-au", { dateStyle: "medium" }).format(
    new Date(date),
  );
}

export function readingTime(content: string) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export const html = String.raw;

// Parse frontmatter from markdown files
function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error("No frontmatter found");
  }

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
  const blogFiles = glob.sync("pages/blog/*.md");
  const posts: PostData[] = [];

  for (const file of blogFiles) {
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

  // Ensure output directory exists
  if (!existsSync("_site")) {
    mkdirSync("_site", { recursive: true });
  }

  // Load blog posts
  const blogPosts = loadBlogPosts();
  console.log(`Loaded ${blogPosts.length} blog posts`);

  // Import page modules
  const { default: IndexPage } = await import("./pages/index.js");
  const { default: BlogPage } = await import("./pages/blog.js");
  const { default: NotFoundPage } = await import("./pages/404.js");
  const { default: PostPage } = await import("./pages/blog/[slug].js");

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
  for (const post of blogPosts) {
    const postHtml = PostPage(post);
    const postDir = `_site/blog/${post.page.fileSlug}`;
    if (!existsSync(postDir)) {
      mkdirSync(postDir, { recursive: true });
    }
    writeFileSync(`${postDir}/index.html`, postHtml);
  }

  // Copy public assets
  console.log("Copying public assets...");
  const publicFiles = glob.sync("public/**/*", { nodir: true });
  for (const file of publicFiles) {
    const destPath = file.replace("public/", "_site/public/");
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    writeFileSync(destPath, readFileSync(file));
  }

  console.log("Build complete!");
}

build();
