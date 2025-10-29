import { readFileSync } from "node:fs";
import { basename } from "node:path";
import Mustache from "mustache";
import { marked } from "marked";
import markedShiki from "marked-shiki";
import { codeToHtml } from "shiki";
import type { RenderablePost } from "../lib/types";
import { formatDate, readingTime } from "../lib/time";

type Frontmatter = Record<string, string>;
type Partials = Record<string, string>;

const parser = marked.use(
  markedShiki({
    async highlight(code, lang) {
      return await codeToHtml(code, { lang, theme: "gruvbox-dark-medium" });
    },
  }),
);

function parseFrontmatter(raw: string, filePath: string) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = raw.match(frontmatterRegex);

  if (!match) {
    throw new Error(`Missing frontmatter in ${filePath}`);
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

async function loadPartials(): Promise<Partials> {
  const glob = new Bun.Glob("components/**/*.html");
  const entries = await Promise.all(
    Array.from(glob.scanSync()).map(async (file) => {
      const key = file.replace(/\.html$/, "");
      const content = await Bun.file(file).text();
      return [key, content] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export class TemplateRenderer {
  private readonly partials: Partials;
  private readonly cache = new Map<string, string>();

  constructor(partials: Partials) {
    this.partials = partials;
  }

  render(templatePath: string, data: Record<string, unknown>) {
    if (!this.cache.has(templatePath)) {
      this.cache.set(templatePath, readFileSync(templatePath, "utf-8"));
    }

    const template = this.cache.get(templatePath) ?? "";
    return Mustache.render(template, data, this.partials);
  }
}

export async function createRenderer() {
  return new TemplateRenderer(await loadPartials());
}

export async function loadPosts(): Promise<RenderablePost[]> {
  const glob = new Bun.Glob("pages/blog/*.md");
  const files = Array.from(glob.scanSync());

  const results = await Promise.allSettled(
    files.map(async (filePath) => {
      const raw = await Bun.file(filePath).text();

      const { frontmatter, content } = parseFrontmatter(raw, filePath);

      const fileSlug = basename(filePath, ".md");

      const html = await parser.parse(content);
      const date = frontmatter.date ?? "";

      return {
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
      } satisfies RenderablePost;
    }),
  );

  const posts: RenderablePost[] = [];
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      posts.push(result.value);
    } else {
      errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason));
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(
      errors.map((message) => new Error(message)),
      "One or more posts failed to load",
    );
  }

  return posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}
