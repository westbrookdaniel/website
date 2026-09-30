import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

for (const path of ["pages/playground.html", "_site/playground/index.html"]) {
  const html = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

  test(`${path}: keeps the playground copy concise`, () => {
    assert.match(html, /Small experiments and games\. Use at your own risk\./);
    assert.match(html, /<p>Klondike, FreeCell, and Pyramid\.<\/p>/);
    assert.match(html, /<p>Guess the word, one letter at a time\.<\/p>/);
    assert.doesNotMatch(html, /Each one has its own page\.|Three quiet card games:|Solitaire ↗|Word game ↗/);
  });

  for (const game of ["cards", "hangman"]) {
    test(`${path}: opens ${game} in a separate tab without boosting`, () => {
      const link = html.match(new RegExp(`<a\\b[^>]*href="/playground/${game}"[^>]*>`))?.[0];
      assert.ok(link, `Missing ${game} link`);
      assert.match(link, /\btarget="_blank"/);
      assert.match(link, /\brel="noopener"/);
      assert.match(link, /\bhx-boost="false"/);
    });
  }
}
