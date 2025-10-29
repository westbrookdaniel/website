import { readFileSync } from "node:fs";
import Mustache from "mustache";

type Partials = Record<string, string>;

function loadPartials(): Partials {
  const partials: Partials = {};
  const glob = new Bun.Glob("components/**/*.html");

  for (const file of glob.scanSync()) {
    const key = file.replace(/\.html$/, "");
    partials[key] = readFileSync(file, "utf-8");
  }

  return partials;
}

export class TemplateRenderer {
  private readonly partials: Partials;

  constructor(partials: Partials) {
    this.partials = partials;
  }

  render(templatePath: string, data: Record<string, unknown>) {
    const template = readFileSync(templatePath, "utf-8");
    return Mustache.render(template, data, this.partials);
  }
}

export function createRenderer() {
  return new TemplateRenderer(loadPartials());
}
