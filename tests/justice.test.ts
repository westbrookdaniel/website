import { describe, expect, test } from "bun:test";
import { Window } from "happy-dom";
import { isPlainProse, prepareProse, renderProse, startJustice } from "../client/justice";

const window = new Window();
const document = window.document;
const source = "  Justice chooses all the line breaks in a paragraph together, keeping spacing consistent while preserving the exact original content.\n";
const measure = (text: string) => [...text].length * 7;
const paragraph = (html: string) => {
  const element = document.createElement("p");
  element.innerHTML = html;
  return element as unknown as HTMLElement;
};

describe("safe prose coverage", () => {
  test("includes plain body copy and excludes metadata", () => {
    expect(isPlainProse(paragraph(source))).toBe(true);
    expect(isPlainProse(paragraph("5 min read"))).toBe(false);
  });
  test("leaves links, emphasis, inline code, images and hard breaks native", () => {
    for (const markup of ["<a href='/'>a link</a>", "<em>emphasis</em>", "<code>code</code>", "<img src='a.png'>", "<br>"]) {
      expect(isPlainProse(paragraph(source + markup))).toBe(false);
    }
  });
  test("leaves NBSP native because CSS word-spacing also affects its width", () => {
    const text = source.replace("line breaks", "line\u00a0breaks");
    const element = paragraph(text);
    expect(isPlainProse(element)).toBe(false);
    expect(renderProse(element, text, prepareProse(text, measure), 300)).toBe(false);
    expect(element.textContent).toBe(text);
  });
  test("respects an explicit opt-out and unsupported writing systems", () => {
    const element = paragraph(source);
    element.setAttribute("data-justice-skip", "");
    expect(isPlainProse(element)).toBe(false);
    expect(isPlainProse(paragraph(source + "שלום"))).toBe(false);
    expect(isPlainProse(paragraph(source + "日本語"))).toBe(false);
  });
  test("bounds the work on unreasonably large paragraphs", () => {
    expect(isPlainProse(paragraph(source.repeat(100)))).toBe(false);
  });
});

describe("source-preserving line rendering", () => {
  test("keeps exact text, whitespace, and one accessible text stream", () => {
    const text = source;
    const element = paragraph(text);
    expect(renderProse(element, text, prepareProse(text, measure), 300)).toBe(true);
    expect(element.textContent).toBe(text);
    expect(element.querySelectorAll("br, [aria-hidden], [aria-label], a").length).toBe(0);
    expect(element.querySelectorAll(".justice-line").length).toBeGreaterThan(1);
    expect(element.lastElementChild?.getAttribute("style")).not.toContain("width");
    const range = document.createRange();
    range.selectNodeContents(element as never);
    expect(range.toString()).toBe(text);
  });
  test("repeated layout replaces wrappers and preserves the same source", () => {
    const element = paragraph(source);
    const prepared = prepareProse(source, measure);
    renderProse(element, source, prepared, 300);
    renderProse(element, source, prepared, 220);
    expect(element.textContent).toBe(source);
    expect(element.querySelectorAll(".justice-line .justice-line").length).toBe(0);
  });
  test("retains native wrapping at narrow, invalid, or single-line widths", () => {
    for (const width of [0, 100, NaN, Infinity, 5000]) {
      const element = paragraph(source);
      expect(renderProse(element, source, prepareProse(source, measure), width)).toBe(false);
      expect(element.textContent).toBe(source);
      expect(element.childElementCount).toBe(0);
    }
  });
  test("does not overflow unbreakable long words or introduce hyphens", () => {
    const text = `This paragraph contains ${"unbreakable".repeat(10)} and other words around it.`;
    const element = paragraph(text);
    expect(renderProse(element, text, prepareProse(text, measure), 200)).toBe(false);
    expect(prepareProse("A well-known source-safe example", measure).hyphenation).toBeUndefined();
  });
  test("renders markup-looking source as text", () => {
    const text = source + " <script>alert('no')</script>";
    const element = paragraph("");
    renderProse(element, text, prepareProse(text, measure), 350);
    expect(element.textContent).toBe(text);
    expect(element.querySelector("script")).toBeNull();
  });
});

test("initial load, resize, font changes, HTMX/history and cleanup stay scoped to blog bodies", async () => {
  const w = new Window();
  const doc = w.document;
  const frames: FrameRequestCallback[] = [];
  const resizeCallbacks: ((entries: { target: HTMLElement; contentRect: { width: number } }[]) => void)[] = [];
  let width = 300;
  Object.defineProperty(w, "requestAnimationFrame", { value: (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; } });
  Object.defineProperty(w, "cancelAnimationFrame", { value: () => {} });
  Object.defineProperty(w, "ResizeObserver", { value: class {
    constructor(callback: typeof resizeCallbacks[number]) { resizeCallbacks.push(callback); }
    observe() {} unobserve() {} disconnect() {}
  } });
  Object.defineProperty(w, "getComputedStyle", { value: () => ({
    direction: "ltr", writingMode: "horizontal-tb", letterSpacing: "normal", wordSpacing: "normal",
    whiteSpace: "normal", textTransform: "none", fontFeatureSettings: "normal", fontVariationSettings: "normal",
    paddingLeft: "0", paddingRight: "0", borderLeftWidth: "0", borderRightWidth: "0",
    fontStyle: "normal", fontVariant: "normal", fontWeight: "400", fontSize: "16px", fontFamily: "sans-serif",
    fontKerning: "auto", fontStretch: "normal", fontVariantCaps: "normal",
  }) });
  Object.defineProperty(w.HTMLCanvasElement.prototype, "getContext", { value: () => ({ measureText: (text: string) => ({ width: measure(text) }) }) });
  Object.defineProperty(w.HTMLElement.prototype, "getBoundingClientRect", { value: () => ({ width }) });
  Object.defineProperty(w.Range.prototype, "getBoundingClientRect", { value: () => ({ width: 0 }) });
  const fonts = new w.EventTarget();
  Object.defineProperty(fonts, "ready", { value: Promise.resolve() });
  Object.defineProperty(doc, "fonts", { value: fonts });
  doc.body.innerHTML = `<main><p id="description">${source}</p><div class="prose"><p id="body">${source}</p><p id="rich">${source}<a href="/">link</a></p><blockquote><p>${source}</p></blockquote></div></main>`;
  const flush = () => { while (frames.length) frames.shift()!(0); };
  const stop = await startJustice(doc as unknown as Document);
  flush();
  const body = doc.querySelector("#body")!;
  expect(body.classList.contains("justice-prose")).toBe(true);
  expect(doc.querySelectorAll(".justice-prose").length).toBe(1);
  expect(doc.querySelector("#description")!.childElementCount).toBe(0);
  const wideLines = body.childElementCount;
  width = 200;
  resizeCallbacks[0]([{ target: body as unknown as HTMLElement, contentRect: { width } }]);
  flush();
  expect(body.childElementCount).toBeGreaterThan(wideLines);
  fonts.dispatchEvent(new w.Event("loadingdone"));
  flush();
  expect(body.textContent).toBe(source);
  doc.dispatchEvent(new w.Event("htmx:beforeHistorySave"));
  expect(body.childElementCount).toBe(0);
  expect(body.textContent).toBe(source);
  flush();
  doc.querySelector(".prose")!.innerHTML = `<p>${source}</p>`;
  for (const event of ["htmx:load", "htmx:historyRestore", "htmx:load"]) {
    doc.dispatchEvent(new w.Event(event));
    flush();
  }
  expect(doc.querySelectorAll(".justice-prose").length).toBe(1);
  expect(doc.querySelectorAll(".justice-line .justice-line").length).toBe(0);
  const updated = doc.querySelector(".prose p")!;
  updated.innerHTML = "Updated prose with <a href='/blog'>a link</a> that must not be overwritten.";
  doc.dispatchEvent(new w.Event("htmx:beforeHistorySave"));
  flush();
  expect(updated.querySelector("a")?.textContent).toBe("a link");
  expect(updated.textContent).toContain("Updated prose");
  stop?.();
  expect(doc.querySelectorAll(".justice-line").length).toBe(0);
  expect(doc.querySelector(".prose p")!.textContent).toContain("Updated prose");
});
