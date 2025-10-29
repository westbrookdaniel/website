import { ensurePublicDir } from "./fs";

export async function buildTailwind() {
  ensurePublicDir();

  const tailwind = Bun.spawn({
    cmd: [
      "bunx",
      "@tailwindcss/cli",
      "-i",
      "./tailwind.css",
      "-o",
      "./_site/public/index.css",
    ],
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await tailwind.exited;
  if (exitCode !== 0) {
    throw new Error(`Tailwind build failed with exit code ${exitCode}`);
  }
}
