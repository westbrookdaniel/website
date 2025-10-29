import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

export const OUTPUT_DIR = "_site";
const PUBLIC_DIR = "public";

export function resetOutputDir() {
  if (existsSync(OUTPUT_DIR)) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
}

export function ensurePublicDir() {
  mkdirSync(join(OUTPUT_DIR, "public"), { recursive: true });
}

export function copyPublicAssets() {
  if (!existsSync(PUBLIC_DIR)) {
    ensurePublicDir();
    return;
  }

  cpSync(PUBLIC_DIR, join(OUTPUT_DIR, "public"), { recursive: true });
}

export function writeOutputFile(relativePath: string, content: string) {
  const filePath = join(OUTPUT_DIR, relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}
