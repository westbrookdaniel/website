import { buildTailwind, copyPublicAssets, resetOutputDir, writeOutputFile } from "./assets";
import { TemplateRenderer, createRenderer, loadPosts } from "./content";
import type { RenderablePost } from "../lib/types";

type Task<T> = () => Promise<T> | T;

export async function buildSite() {
  const logger = createLogger();
  const runTask = createTaskRunner(logger);
  const buildStart = performance.now();

  try {
    await runTask("Reset output directory", resetOutputDir);

    await Promise.all([
      runTask("Copy public assets", copyPublicAssets),
      runTask("Build Tailwind CSS", buildTailwind),
    ]);

    const [renderer, posts] = await Promise.all([
      runTask("Load templates", createRenderer),
      runTask("Load posts", loadPosts),
    ]);

    await runTask("Render static pages", () => renderStaticPages(renderer, posts));
    await runTask("Render blog posts", () => renderBlogPosts(renderer, posts));

    logger.complete(performance.now() - buildStart);
  } catch (error) {
    logger.failed(performance.now() - buildStart, error);
    throw error;
  }
}

function renderStaticPages(renderer: TemplateRenderer, posts: RenderablePost[]) {
  const latestPosts = posts.slice(0, 3);

  const indexContent = renderer.render("pages/index.html", { latestPosts });
  const indexHtml = renderWithLayout(renderer, {
    meta: { title: "Daniel Westbrook - Web Developer" },
    nav: { homeActive: true, blogActive: false },
    content: indexContent,
  });
  writeOutputFile("index.html", indexHtml);

  const blogContent = renderer.render("pages/blog.html", { posts });
  const blogHtml = renderWithLayout(renderer, {
    meta: { title: "Blog - Daniel Westbrook" },
    nav: { homeActive: false, blogActive: true },
    content: blogContent,
  });
  writeOutputFile("blog/index.html", blogHtml);

  const notFoundContent = renderer.render("pages/404.html", {});
  const notFoundHtml = renderWithLayout(renderer, {
    meta: { title: "Not Found - Daniel Westbrook" },
    nav: { homeActive: false, blogActive: false },
    content: notFoundContent,
  });
  writeOutputFile("404.html", notFoundHtml);
}

async function renderBlogPosts(renderer: TemplateRenderer, posts: RenderablePost[]) {
  await Promise.all(
    posts.map(async (post) => {
      const postHtml = renderer.render("components/layouts/post.html", {
        nav: { homeActive: false, blogActive: true },
        post,
        content: post.html,
      });
      writeOutputFile(`blog/${post.page.fileSlug}/index.html`, postHtml);
    }),
  );
}

function renderWithLayout(renderer: TemplateRenderer, data: Record<string, unknown>) {
  return renderer.render("components/layouts/main.html", data);
}

function createTaskRunner(logger: ReturnType<typeof createLogger>) {
  return async function runTask<T>(label: string, task: Task<T>): Promise<T> {
    const startedAt = logger.start(label);

    try {
      const result = await task();
      logger.succeed(label, startedAt);
      return result;
    } catch (error) {
      logger.fail(label, startedAt, error);
      throw error;
    }
  };
}

export const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
  purple: "\x1b[35m",
};

function createLogger() {
  return {
    start(_label: string) {
      return performance.now();
    },
    succeed(label: string, startedAt: number) {
      console.log(`${colors.dim}${label} (${formatDuration(performance.now() - startedAt)})${colors.reset}`);
    },
    fail(label: string, startedAt: number, error: unknown) {
      console.error(
        `${colors.red}${label} (${formatDuration(performance.now() - startedAt)})${colors.reset}`,
      );
      printErrorDetails(error);
    },
    complete(duration: number) {
      console.log(`\nBuild finished in ${formatDuration(duration)}`);
    },
    failed(duration: number, error: unknown) {
      console.error(`\n${colors.red}Build failed after ${formatDuration(duration)}${colors.reset}`);
      printErrorDetails(error);
    },
  };
}

function formatDuration(ms: number) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  return `${(ms / 1000).toFixed(2)}s`;
}

function printErrorDetails(error: unknown) {
  if (error instanceof AggregateError) {
    for (const inner of error.errors) {
      printErrorDetails(inner);
    }
    return;
  }

  if (error instanceof Error) {
    const stack = error.stack ?? error.message;
    for (const line of stack.split("\n")) {
      console.error(`    ${line}`);
    }
    return;
  }

  console.error(`    ${String(error)}`);
}

if (import.meta.main) {
  buildSite().catch(() => {
    process.exitCode = 1;
  });
}
