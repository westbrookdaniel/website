import test from "node:test";
import assert from "node:assert/strict";
import { applyAction, canMove, isExposed, legalMoves, newGame } from "../public/cards.js";

const deck = Array.from({ length: 52 }, (_, id) => id);

test("deals all 52 cards in each game", () => {
  const klondike = newGame("klondike", {}, deck);
  assert.equal(klondike.stock.length + klondike.tableau.flat().length, 52);
  assert.deepEqual(klondike.tableau.map((pile) => pile.length), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(klondike.tableau.every((pile) => pile.filter((card) => card.up).length === 1), true);
  const freecell = newGame("freecell", {}, deck);
  assert.deepEqual(freecell.tableau.map((pile) => pile.length), [7, 7, 7, 7, 6, 6, 6, 6]);
  const pyramid = newGame("pyramid", {}, deck);
  assert.equal(pyramid.pyramid.length, 28);
  assert.equal(pyramid.stock.length, 24);
});

test("Solitaire follows alternating colors, Kings on empty columns, foundations, and undo", () => {
  const game = newGame("klondike", {}, deck);
  game.tableau = [[{ id: 25, up: true }], [{ id: 11, up: true }], []]; // K♥, Q♠
  game.stock = []; game.waste = [];
  const queen = { zone: "tableau", index: 1, start: 0 };
  assert.equal(canMove(game, queen, { zone: "tableau", index: 0 }), true);
  assert.equal(canMove(game, queen, { zone: "tableau", index: 2 }), false);
  assert.equal(canMove(game, { zone: "tableau", index: 0, start: 0 }, { zone: "tableau", index: 2 }), true);
  const moved = applyAction(game, { type: "move", from: queen, to: { zone: "tableau", index: 0 } });
  assert.equal(moved.tableau[0].length, 2);
  assert.deepEqual(applyAction(moved, { type: "undo" }).tableau, game.tableau);
  assert.equal(canMove(game, queen, { zone: "foundation", index: 0 }), false);
});

test("Solitaire draw-three, recycling, and winning foundation", () => {
  let game = newGame("klondike", { drawCount: 3 }, deck);
  const initial = game.stock.length;
  game = applyAction(game, { type: "draw" });
  assert.equal(game.stock.length, initial - 3);
  assert.equal(game.waste.length, 3);
  game.stock = [];
  const waste = [...game.waste];
  game = applyAction(game, { type: "draw" });
  assert.deepEqual(game.stock, waste.reverse());
  game = newGame("klondike", {}, deck);
  game.foundations = [deck.slice(0, 12), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];
  game.tableau = [[{ id: 12, up: true }]];
  game.stock = []; game.waste = [];
  game = applyAction(game, { type: "move", from: { zone: "tableau", index: 0, start: 0 }, to: { zone: "foundation", index: 0 } });
  assert.equal(game.outcome, "won");
});

test("FreeCell respects free cells and movable-run capacity", () => {
  const game = newGame("freecell", {}, deck);
  game.tableau = [[25, 11], [38], [], [], [], [], [], []]; // K♥ Q♠ and K♦
  game.cells = [null, null, null, null];
  const run = { zone: "tableau", index: 0, start: 0 };
  assert.equal(canMove(game, run, { zone: "tableau", index: 2 }), true);
  game.cells = [0, 1, 2, 3];
  game.tableau[3] = [4]; game.tableau[4] = [5]; game.tableau[5] = [6]; game.tableau[6] = [7]; game.tableau[7] = [8];
  assert.equal(canMove(game, run, { zone: "tableau", index: 2 }), false);
  game.cells[0] = null;
  assert.equal(canMove(game, { zone: "tableau", index: 0, start: 1 }, { zone: "cell", index: 0 }), true);
});

test("FreeCell finishes when the last card reaches its foundation", () => {
  let game = newGame("freecell", {}, deck);
  game.foundations = [deck.slice(0, 12), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];
  game.tableau = [[12], [], [], [], [], [], [], []];
  game.cells = [null, null, null, null];
  game = applyAction(game, { type: "move", from: { zone: "tableau", index: 0, start: 0 }, to: { zone: "foundation", index: 0 } });
  assert.equal(game.outcome, "won");
});

test("Pyramid exposes children correctly, removes pairs and Kings, and limits redeals", () => {
  let game = newGame("pyramid", { pyramidRedeals: 1 }, deck);
  assert.equal(isExposed(game, 0), false);
  assert.equal(isExposed(game, 27), true);
  game.pyramid[27].id = 12; // King
  game = applyAction(game, { type: "move", from: { zone: "pyramid", index: 27 }, to: null });
  assert.equal(game.pyramid[27].removed, true);
  assert.equal(applyAction(game, { type: "undo" }).pyramid[27].removed, false);
  game.pyramid[26].id = 7; // Eight
  game.pyramid[25].id = 17; // Five
  game = applyAction(game, { type: "move", from: { zone: "pyramid", index: 26 }, to: { zone: "pyramid", index: 25 } });
  assert.equal(game.pyramid[25].removed, true);
  assert.equal(game.pyramid[26].removed, true);
  game.stock = []; game.waste = [1, 2];
  game = applyAction(game, { type: "draw" });
  assert.equal(game.redeals, 1);
  game.stock = []; game.waste = [1, 2];
  assert.equal(legalMoves(game).some((move) => move.type === "draw"), false);
});

test("Pyramid win clears only the pyramid", () => {
  let game = newGame("pyramid", {}, deck);
  game.pyramid.forEach((card) => { card.removed = true; });
  game.pyramid[27] = { id: 12, removed: false };
  game = applyAction(game, { type: "move", from: { zone: "pyramid", index: 27 }, to: null });
  assert.equal(game.outcome, "won");
});

test("Pyramid detects a stuck game after the last legal move", () => {
  let game = newGame("pyramid", {}, deck);
  game.pyramid.forEach((card) => { card.removed = true; });
  game.pyramid[26] = { id: 0, removed: false }; // Ace
  game.pyramid[27] = { id: 12, removed: false }; // King
  game.stock = []; game.waste = [];
  game = applyAction(game, { type: "move", from: { zone: "pyramid", index: 27 }, to: null });
  assert.equal(game.outcome, "stuck");
});
