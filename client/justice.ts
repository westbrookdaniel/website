/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { prepare, solve, type Prepared } from "@kitlangton/justice";

const selector = "main .prose p, main .prose li";
const whitespace = /[^ \t\r\n\f]+/g;
// Justice's current rendering contract is horizontal, space-delimited LTR text.
const unsupportedScript = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}\u202a-\u202e\u2066-\u2069]/u;

export function isPlainProse(element: HTMLElement): boolean {
  return element.children.length === 0 &&
    !element.closest("[data-justice-skip], [contenteditable], pre, code, nav, button, blockquote") &&
    !unsupportedScript.test(element.textContent ?? "") &&
    !(element.textContent ?? "").includes("\u00a0") &&
    (element.textContent?.match(whitespace)?.length ?? 0) >= 8 &&
    (element.textContent?.length ?? 0) <= 12_000;
}

export function prepareProse(text: string, measure: (text: string) => number): Prepared {
  const prepared = prepare(text, measure);
  // Keep original words intact. Discretionary and source-hyphen splitting need a
  // richer source/copy adapter and are deliberately not enabled here.
  prepared.hyphenation = undefined;
  return prepared;
}

/** Render only wrappers around the original text, never a duplicate or aria-label. */
export function renderProse(element: HTMLElement, source: string, prepared: Prepared, width: number): boolean {
  if (!Number.isFinite(width) || width < 160 || source.includes("\u00a0")) return false;
  const layout = solve(prepared, width, { opening: 0, hanging: 0, protrusion: 0 });
  if (layout.lines.length < 2 || layout.lines.some((line) =>
    !Number.isFinite(line.wordSpacing) || !Number.isFinite(line.tracking) ||
    line.residual < -0.5 || line.startOffset || line.endOffset || line.hyphenated
  )) return false;

  const words = [...source.matchAll(whitespace)];
  const fragment = element.ownerDocument.createDocumentFragment();
  let offset = 0;
  for (const line of layout.lines) {
    const start = words[line.start]?.index;
    const last = words[line.end - 1];
    if (start === undefined || !last) return false;
    const end = last.index + last[0].length;
    fragment.append(source.slice(offset, start));
    const span = element.ownerDocument.createElement("span");
    span.className = "justice-line";
    span.style.wordSpacing = `${line.wordSpacing}px`;
    span.style.letterSpacing = `${line.tracking}px`;
    // Inline-block lines retain native selection/copy and a single text stream.
    // Full lines occupy one measure; the last line stays naturally ragged.
    if (!line.last) span.style.width = "100%";
    span.textContent = source.slice(start, end);
    fragment.append(span);
    offset = end;
  }
  fragment.append(source.slice(offset));
  element.replaceChildren(fragment);
  element.classList.add("justice-prose");
  return true;
}

type Paragraph = { source: string; prepared?: Prepared; font?: string; width?: number };

export async function startJustice(doc: Document = document) {
  const win = doc.defaultView;
  if (!win || !("ResizeObserver" in win) || !("Segmenter" in Intl)) return;
  await doc.fonts?.ready;
  const canvas = doc.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;

  const paragraphs = new Map<HTMLElement, Paragraph>();
  const pending = new Set<HTMLElement>();
  let frame = 0;
  let stopped = false;

  function restore(element: HTMLElement, state: Paragraph): boolean {
    // An in-place content update belongs to the page, never to our cached source.
    if (element.textContent !== state.source || [...element.children].some((child) =>
      !child.classList.contains("justice-line")
    )) {
      element.classList.remove("justice-prose");
      observer.unobserve(element);
      paragraphs.delete(element);
      pending.delete(element);
      return false;
    }
    if (element.classList.contains("justice-prose")) {
      element.textContent = state.source;
      element.classList.remove("justice-prose");
    }
    return true;
  }

  function layout(element: HTMLElement, state: Paragraph) {
    if (!restore(element, state)) return;
    const style = win!.getComputedStyle(element);
    if (style.direction !== "ltr" || style.writingMode !== "horizontal-tb" ||
      !["normal", "0px"].includes(style.letterSpacing) ||
      !["normal", "0px"].includes(style.wordSpacing) ||
      !["normal", "collapse"].includes(style.whiteSpace) ||
      style.textTransform !== "none" || style.fontFeatureSettings !== "normal" ||
      style.fontVariationSettings !== "normal") return;

    const width = element.getBoundingClientRect().width -
      parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) -
      parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
    state.width = width;
    if (width < 160) return;
    const font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const key = [font, style.fontKerning, style.fontStretch, style.fontVariantCaps].join("|");
    try {
      if (state.font !== key || !state.prepared) {
        context!.font = font;
        context!.fontKerning = style.fontKerning as CanvasFontKerning;
        context!.fontStretch = style.fontStretch as CanvasFontStretch;
        context!.fontVariantCaps = style.fontVariantCaps as CanvasFontVariantCaps;
        state.prepared = prepareProse(state.source, (text) => context!.measureText(text).width);
        state.font = key;
      }
      if (renderProse(element, state.source, state.prepared, width)) {
        // Shaping, browser metrics, or unusual fonts can differ from canvas.
        // Prefer intact native wrapping over even a small horizontal overflow.
        const range = doc.createRange();
        for (const line of element.querySelectorAll(".justice-line")) {
          range.selectNodeContents(line);
          if (range.getBoundingClientRect().width > width + 1) {
            restore(element, state);
            break;
          }
        }
      }
    } catch {
      restore(element, state);
    }
  }

  function queue(element: HTMLElement) {
    pending.add(element);
    if (frame || stopped) return;
    frame = win!.requestAnimationFrame(() => {
      frame = 0;
      for (const element of pending) {
        const state = paragraphs.get(element);
        if (state && element.isConnected) layout(element, state);
      }
      pending.clear();
    });
  }

  const observer = new win.ResizeObserver((entries) => {
    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      const state = paragraphs.get(element);
      if (state && Math.abs(entry.contentRect.width - (state.width ?? 0)) > 0.1) queue(element);
    }
  });

  function refresh() {
    for (const element of paragraphs.keys()) {
      if (!element.isConnected) {
        observer.unobserve(element);
        paragraphs.delete(element);
        pending.delete(element);
      }
    }
    for (const element of doc.querySelectorAll<HTMLElement>(selector)) {
      if (paragraphs.has(element)) continue;
      // History loaded from an older session may already contain line wrappers.
      if (element.classList.contains("justice-prose")) {
        element.textContent = element.textContent;
        element.classList.remove("justice-prose");
      }
      if (!isPlainProse(element)) continue;
      paragraphs.set(element, { source: element.textContent ?? "" });
      observer.observe(element);
      queue(element);
    }
  }

  function remeasure() {
    for (const [element, state] of paragraphs) {
      state.prepared = undefined;
      queue(element);
    }
  }

  function beforeHistorySave() {
    for (const [element, state] of paragraphs) {
      restore(element, state);
      queue(element);
    }
  }

  const events = ["htmx:load", "htmx:historyRestore"];
  for (const event of events) doc.addEventListener(event, refresh);
  doc.addEventListener("htmx:beforeHistorySave", beforeHistorySave);
  doc.fonts?.addEventListener("loadingdone", remeasure);
  win.addEventListener("resize", remeasure);
  refresh();

  return () => {
    stopped = true;
    win.cancelAnimationFrame(frame);
    observer.disconnect();
    for (const [element, state] of paragraphs) restore(element, state);
    for (const event of events) doc.removeEventListener(event, refresh);
    doc.removeEventListener("htmx:beforeHistorySave", beforeHistorySave);
    doc.fonts?.removeEventListener("loadingdone", remeasure);
    win.removeEventListener("resize", remeasure);
    paragraphs.clear();
    pending.clear();
  };
}
