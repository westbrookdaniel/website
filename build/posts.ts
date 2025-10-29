import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { marked } from "marked";
import markedShiki from "marked-shiki";
import { codeToHtml } from "shiki";
import type { RenderablePost } from "../lib/types";
import { formatDate, readingTime } from "../lib/time";

type Frontmatter = Record<string, string>;

const parser = marked.use(
  markedShiki({
    async highlight(code, lang) {
      return await codeToHtml(code, { lang, theme: "gruvbox-dark-medium" });
    },
  }),
);

function parseFrontmatter(raw: string) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = raw.match(frontmatterRegex);

  if (!match) {
    throw new Error("Missing frontmatter");
  }

  const [, meta, content] = match;
  const frontmatter: Frontmatter = {};

  for (const line of meta.split("\n")) {
    const [key, ...valueParts] = line.split(":");
    if (!key || valueParts.length === 0) continue;

    const value = valueParts
      .join(":")
      .trim()
      .replace(/^["']|["']$/g, "");
    frontmatter[key.trim()] = value;
  }

  return { frontmatter, content };
}

export async function loadPosts(): Promise<RenderablePost[]> {
  const posts: RenderablePost[] = [];
  const glob = new Bun.Glob("pages/blog/*.md");

  for (const filePath of glob.scanSync()) {
    try {
      const raw = readFileSync(filePath, "utf-8");
      const { frontmatter, content } = parseFrontmatter(raw);
      const fileSlug = basename(filePath, ".md");

      const html = await parser.parse(content);
      const date = frontmatter.date ?? "";

      posts.push({
        page: { fileSlug },
        data: {
          title: frontmatter.title ?? "",
          description: frontmatter.description ?? "",
          date,
          snippet: frontmatter.snippet,
          tags: frontmatter.tags,
        },
        content,
        formattedDate: date ? formatDate(date) : "",
        readingTime: readingTime(content),
        html,
      });
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  return posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
}
