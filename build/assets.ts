import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const OUTPUT_DIR = "_site";
const PUBLIC_DIR = "public";
const TEMP_DIR = ".tmp";
const BUN_CACHE_DIR = ".bunx-cache";

export function resetOutputDir() {
  if (existsSync(OUTPUT_DIR)) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(join(OUTPUT_DIR, "public"), { recursive: true });
}

export function copyPublicAssets() {
  if (!existsSync(PUBLIC_DIR)) {
    return;
  }

  cpSync(PUBLIC_DIR, join(OUTPUT_DIR, "public"), {
    recursive: true,
  });
}

export async function buildTailwind() {
  mkdirSync(TEMP_DIR, { recursive: true });
  mkdirSync(BUN_CACHE_DIR, { recursive: true });

  const tailwindExecutable = join(process.cwd(), "node_modules/.bin/tailwindcss");
  const cmd = existsSync(tailwindExecutable)
    ? [tailwindExecutable, "-i", "./tailwind.css", "-o", "./_site/public/index.css"]
    : ["bunx", "@tailwindcss/cli", "-i", "./tailwind.css", "-o", "./_site/public/index.css"];

  const tailwind = Bun.spawn({
    cmd,
    env: {
      ...process.env,
      TMPDIR: join(process.cwd(), TEMP_DIR),
      TMP: join(process.cwd(), TEMP_DIR),
      TEMP: join(process.cwd(), TEMP_DIR),
      BUN_INSTALL_CACHE_DIR: join(process.cwd(), BUN_CACHE_DIR),
    },
    stderr: "ignore",
    stdout: "ignore",
  });

  const exitCode = await tailwind.exited;
  if (exitCode !== 0) {
    throw new Error(`Tailwind build failed (exit code ${exitCode})`);
  }
}

export function writeOutputFile(relativePath: string, content: string) {
  const filePath = join(OUTPUT_DIR, relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}
