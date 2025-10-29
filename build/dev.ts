import { join, normalize } from "node:path";
import { buildSite, colors } from "./index";
import { OUTPUT_DIR } from "./assets";
import { watch } from "node:fs";

async function main() {
  console.log(`${colors.purple}[dev] Running initial build...${colors.reset}`);
  await buildSite();

  const buildProcess = Bun.spawn({
    cmd: ["bun", "--watch", "run", "build/index.ts"],
    stdout: "inherit",
    stderr: "inherit",
  });

  const fallbackServer = startStaticServer();

  process.on("SIGINT", () => {
    buildProcess.kill("SIGINT");
    fallbackServer?.stop();
  });

  const handler = debounce(async (_, filename) => {
    if (!filename) return;
    console.log(`${colors.purple}[dev] Detected change in ${filename}${colors.reset}`);
    await buildSite();
  }, 100);

  ["components", "pages", "lib"].forEach((path) => {
    const watcher = watch(path, { recursive: true }, handler);
    process.on("SIGINT", () => watcher.close());
  });

  const exitCode = await buildProcess.exited;

  process.exitCode = exitCode;
}

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

function startStaticServer() {
  const port = Number(process.env.PORT ?? 4000);
  const baseDir = join(process.cwd(), OUTPUT_DIR);

  const server = Bun.serve({
    port,
    development: true,
    async fetch(request) {
      const fileResponse = await serveStaticFile(baseDir, request);
      if (fileResponse) return fileResponse;

      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`${colors.purple}[dev] Listening at http://localhost:${port}${colors.reset}`);
  return server;
}

async function serveStaticFile(baseDir: string, request: Request) {
  const url = new URL(request.url);
  const decodedPath = decodeURIComponent(url.pathname);

  const normalized = normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const trimmed = normalized.replace(/^\/+/, "").replace(/\/+$/, "");

  const candidates = new Set<string>();

  if (!trimmed || trimmed === ".") {
    candidates.add("index.html");
  } else {
    candidates.add(trimmed);
    candidates.add(`${trimmed}/index.html`);

    if (!trimmed.includes(".")) {
      candidates.add(`${trimmed}.html`);
    }
  }

  for (const candidate of candidates) {
    const file = Bun.file(join(baseDir, candidate));
    if (await file.exists()) {
      return new Response(file);
    }
  }

  const notFound = Bun.file(join(baseDir, "404.html"));
  if (await notFound.exists()) {
    return new Response(notFound, { status: 404 });
  }

  return null;
}

main().catch((error) => {
  console.error("[dev] Failed to start development workflow.");
  printErrorDetails(error);
  process.exit(1);
});

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
