const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const STORAGE = "dw-cards-v1";
const copy = (value) => JSON.parse(JSON.stringify(value));
const idOf = (card) => typeof card === "number" ? card : card.id;
export const rank = (id) => id % 13 + 1;
export const suit = (id) => Math.floor(id / 13);
export const color = (id) => suit(id) === 1 || suit(id) === 2 ? 1 : 0;
const label = (id) => `${RANKS[rank(id)]}${SUITS[suit(id)]}`;

export function shuffle() {
  const deck = Array.from({ length: 52 }, (_, id) => id);
  for (let i = 51; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function newGame(mode, prefs = {}, deck = shuffle()) {
  const cards = [...deck];
  if (cards.length !== 52 || new Set(cards).size !== 52) throw new Error("A full deck is required");
  const base = { mode, history: [], moves: 0, outcome: "playing", drawCount: prefs.drawCount === 3 ? 3 : 1, maxRedeals: prefs.pyramidRedeals === 1 ? 1 : 0 };
  if (mode === "klondike") {
    const tableau = Array.from({ length: 7 }, () => []);
    for (let column = 0; column < 7; column++) {
      for (let row = 0; row <= column; row++) tableau[column].push({ id: cards.pop(), up: row === column });
    }
    return { ...base, tableau, stock: cards, waste: [], foundations: [[], [], [], []] };
  }
  if (mode === "freecell") {
    const tableau = Array.from({ length: 8 }, (_, column) => cards.splice(0, column < 4 ? 7 : 6));
    return { ...base, tableau, cells: [null, null, null, null], foundations: [[], [], [], []] };
  }
  if (mode === "pyramid") return { ...base, pyramid: cards.splice(0, 28).map((id) => ({ id, removed: false })), stock: cards, waste: [], redeals: 0 };
  throw new Error(`Unknown game: ${mode}`);
}

export function isExposed(state, index) {
  if (state.mode !== "pyramid" || state.pyramid[index]?.removed) return false;
  const row = Math.floor((Math.sqrt(8 * index + 1) - 1) / 2);
  if (row === 6) return true;
  const column = index - row * (row + 1) / 2;
  const next = (row + 1) * (row + 2) / 2;
  return state.pyramid[next + column].removed && state.pyramid[next + column + 1].removed;
}

export function sourceCards(state, from) {
  if (!from) return [];
  const { zone, index, start } = from;
  if (state.mode === "pyramid") {
    if (zone === "pyramid" && isExposed(state, index)) return [state.pyramid[index].id];
    if (zone === "waste" && state.waste.length) return [state.waste.at(-1)];
    return [];
  }
  if (zone === "tableau") {
    const pile = state.tableau[index];
    if (!pile || start == null || start < 0 || start >= pile.length) return [];
    if (state.mode === "klondike") {
      const group = pile.slice(start);
      return group.every((item) => item.up) ? group.map(idOf) : [];
    }
    const group = pile.slice(start);
    for (let i = 1; i < group.length; i++) {
      if (rank(group[i - 1]) !== rank(group[i]) + 1 || color(group[i - 1]) === color(group[i])) return [];
    }
    return group;
  }
  if (zone === "waste" && state.waste?.length) return [state.waste.at(-1)];
  if (zone === "cell" && state.cells?.[index] != null) return [state.cells[index]];
  if (zone === "foundation" && state.foundations?.[index]?.length) return [state.foundations[index].at(-1)];
  return [];
}

export function canMove(state, from, to) {
  const cards = sourceCards(state, from);
  if (!cards.length) return false;
  if (state.mode === "pyramid") {
    if (to == null) return rank(cards[0]) === 13;
    if (from.zone === to.zone && from.index === to.index) return false;
    const partner = sourceCards(state, to);
    return partner.length === 1 && rank(cards[0]) + rank(partner[0]) === 13;
  }
  if (!to || (from.zone === to.zone && from.index === to.index)) return false;
  const first = cards[0];
  if (to.zone === "foundation") {
    if (cards.length !== 1 || to.index !== suit(first)) return false;
    const pile = state.foundations[to.index];
    return pile.length === rank(first) - 1;
  }
  if (to.zone === "cell") return state.mode === "freecell" && cards.length === 1 && state.cells[to.index] == null;
  if (to.zone !== "tableau") return false;
  const pile = state.tableau[to.index];
  if (!pile) return false;
  if (state.mode === "freecell" && cards.length > 1) {
    const emptyCells = state.cells.filter((cell) => cell == null).length;
    const emptyColumns = state.tableau.filter((column) => !column.length).length - (pile.length ? 0 : 1);
    if (cards.length > (emptyCells + 1) * 2 ** emptyColumns) return false;
  }
  if (!pile.length) return state.mode === "freecell" || rank(first) === 13;
  const top = idOf(pile.at(-1));
  return rank(top) === rank(first) + 1 && color(top) !== color(first);
}

export function canDraw(state) {
  if (state.mode === "freecell") return false;
  if (state.stock.length) return true;
  if (!state.waste.length) return false;
  return state.mode === "klondike" || state.redeals < state.maxRedeals;
}

function snapshot(state) {
  const previous = copy(state);
  previous.history = [];
  return previous;
}

function removeSource(state, from) {
  if (from.zone === "tableau") {
    const removed = state.tableau[from.index].splice(from.start);
    if (state.mode === "klondike" && state.tableau[from.index].length) state.tableau[from.index].at(-1).up = true;
    return removed.map(idOf);
  }
  if (from.zone === "cell") { const id = state.cells[from.index]; state.cells[from.index] = null; return [id]; }
  if (from.zone === "foundation") return [state.foundations[from.index].pop()];
  return [state.waste.pop()];
}

export function applyAction(state, action) {
  if (action.type === "undo") {
    if (!state.history.length) return state;
    const previous = copy(state.history.at(-1));
    previous.history = state.history.slice(0, -1);
    return previous;
  }
  if (state.outcome !== "playing") return state;
  if (action.type === "draw" && !canDraw(state)) return state;
  if (action.type === "move" && !canMove(state, action.from, action.to)) return state;
  if (action.type !== "draw" && action.type !== "move") return state;
  const next = copy(state);
  next.history = [...state.history, snapshot(state)].slice(-100);
  next.moves++;
  if (action.type === "draw") {
    if (!next.stock.length) {
      next.stock = next.waste.reverse();
      next.waste = [];
      if (next.mode === "pyramid") next.redeals++;
    } else {
      const count = next.mode === "klondike" ? next.drawCount : 1;
      for (let i = 0; i < count && next.stock.length; i++) next.waste.push(next.stock.pop());
    }
  } else if (next.mode === "pyramid") {
    for (const ref of [action.from, action.to].filter(Boolean)) {
      if (ref.zone === "pyramid") next.pyramid[ref.index].removed = true;
      else next.waste.pop();
    }
  } else {
    const cards = removeSource(next, action.from);
    if (action.to.zone === "tableau") next.tableau[action.to.index].push(...cards.map((id) => next.mode === "klondike" ? { id, up: true } : id));
    else if (action.to.zone === "foundation") next.foundations[action.to.index].push(cards[0]);
    else next.cells[action.to.index] = cards[0];
  }
  if (next.mode === "pyramid" ? next.pyramid.every((card) => card.removed) : next.foundations.every((pile) => pile.length === 13)) next.outcome = "won";
  else if (legalMoves(next).length === 0) next.outcome = "stuck";
  return next;
}

export function legalMoves(state) {
  const moves = [];
  if (state.mode === "pyramid") {
    const sources = state.pyramid.map((_, index) => ({ zone: "pyramid", index })).filter((ref) => sourceCards(state, ref).length);
    if (state.waste.length) sources.push({ zone: "waste" });
    for (let i = 0; i < sources.length; i++) {
      if (canMove(state, sources[i], null)) moves.push({ type: "move", from: sources[i], to: null });
      for (let j = i + 1; j < sources.length; j++) if (canMove(state, sources[i], sources[j])) moves.push({ type: "move", from: sources[i], to: sources[j] });
    }
  } else {
    const sources = [];
    state.tableau.forEach((pile, index) => pile.forEach((_, start) => { if (sourceCards(state, { zone: "tableau", index, start }).length) sources.push({ zone: "tableau", index, start }); }));
    if (state.waste?.length) sources.push({ zone: "waste" });
    state.cells?.forEach((card, index) => { if (card != null) sources.push({ zone: "cell", index }); });
    state.foundations.forEach((pile, index) => { if (pile.length) sources.push({ zone: "foundation", index }); });
    const targets = [
      ...state.foundations.map((_, index) => ({ zone: "foundation", index })),
      ...state.tableau.map((_, index) => ({ zone: "tableau", index })),
      ...(state.cells?.map((_, index) => ({ zone: "cell", index })) ?? []),
    ];
    for (const from of sources) for (const to of targets) if (canMove(state, from, to)) moves.push({ type: "move", from, to });
  }
  if (canDraw(state)) moves.push({ type: "draw" });
  return moves;
}

export const describeMove = (state, move) => {
  if (move.type === "draw") return state.stock.length ? "Draw from the stock." : "Turn the waste over for another pass.";
  const card = label(sourceCards(state, move.from)[0]);
  if (state.mode === "pyramid") return move.to ? `Pair ${card} with ${label(sourceCards(state, move.to)[0])}.` : `Remove the ${card}.`;
  const target = move.to.zone === "foundation" ? "its foundation" : move.to.zone === "cell" ? "an open free cell" : `column ${move.to.index + 1}`;
  return `Move ${card} to ${target}.`;
};

if (typeof document !== "undefined") init();

function init() {
  const root = document.querySelector("#app");
  const board = document.querySelector("#board");
  const toast = document.querySelector("#toast");
  const dialog = document.querySelector("#dialog");
  const dialogContent = document.querySelector("#dialog-content");
  const defaults = { theme: "light", back: "lines", reducedMotion: false, drawCount: 1, pyramidRedeals: 0 };
  let prefs = read(`${STORAGE}-prefs`) ?? defaults;
  prefs = { ...defaults, ...prefs };
  let state = null;
  let selected = null;
  let tutorialMode = null;
  let tutorialStep = 0;
  let practiceSelected = false;

  function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function save() { if (state) write(`${STORAGE}-${state.mode}`, state); }
  function note(message) { toast.textContent = message; }
  function applyPrefs() {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.dataset.back = prefs.back;
    document.documentElement.classList.toggle("reduced", prefs.reducedMotion);
    write(`${STORAGE}-prefs`, prefs);
  }
  function closeDialog() { if (dialog.open) dialog.close(); dialogContent.replaceChildren(); tutorialMode = null; }
  function showDialog(html) { dialogContent.innerHTML = html; if (!dialog.open) dialog.showModal(); }
  function card(id, ref, options = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `card ${options.faceDown ? "down" : color(id) ? "red" : "black"}${options.active ? " selected" : ""}${options.target ? " target" : ""}`;
    button.innerHTML = options.faceDown ? '<span class="back-mark" aria-hidden="true">✳</span>' : `<span class="rank">${RANKS[rank(id)]}<small>${SUITS[suit(id)]}</small></span><span class="pip" aria-hidden="true">${SUITS[suit(id)]}</span>`;
    button.setAttribute("aria-label", `${options.faceDown ? "Face-down card" : `${RANKS[rank(id)]} of ${["spades", "hearts", "diamonds", "clubs"][suit(id)]}`}${options.target ? ", legal destination" : ""}`);
    if (!options.faceDown) button.addEventListener("click", () => tap(ref));
    else button.disabled = true;
    return button;
  }
  function place(zone, index, title) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `place${selected && canMove(state, selected, { zone, index }) ? " target" : ""}`;
    button.textContent = title;
    button.setAttribute("aria-label", `${title}${index != null ? ` ${index + 1}` : ""}`);
    button.addEventListener("click", () => tap({ zone, index }));
    return button;
  }
  function same(a, b) { return a && b && a.zone === b.zone && a.index === b.index && a.start === b.start; }
  function highlight(ref) { return selected && canMove(state, selected, ref); }
  function tap(ref) {
    if (state.outcome !== "playing") return;
    if (selected && same(selected, ref)) { selected = null; renderBoard(); return; }
    if (selected && canMove(state, selected, ref)) { commit({ type: "move", from: selected, to: ref }); return; }
    if (state.mode === "pyramid" && sourceCards(state, ref).length === 1 && canMove(state, ref, null)) { commit({ type: "move", from: ref, to: null }); return; }
    if (sourceCards(state, ref).length) { selected = ref; note(""); renderBoard(); }
    else note("That move isn't available. Choose a face-up card or open space.");
  }
  function commit(action) {
    const next = applyAction(state, action);
    if (next === state) return;
    state = next;
    selected = null;
    save();
    renderBoard();
    if (state.outcome === "won") win();
    else if (state.outcome === "stuck") note("No legal moves remain. Undo or start a new deal.");
    else note("");
  }
  function win() {
    showDialog(`<div class="win-mark" aria-hidden="true">✦</div><p class="overline">A good finish</p><h2>You did it.</h2><p>You cleared ${state.mode === "pyramid" ? "the pyramid" : "all four foundations"} in ${state.moves} moves.</p><div class="dialog-actions"><button id="again" class="primary">Play again</button><button id="back-home">All games</button></div>`);
    dialogContent.querySelector("#again").onclick = () => { closeDialog(); start(state.mode, true); };
    dialogContent.querySelector("#back-home").onclick = () => { closeDialog(); home(); };
  }
  function renderBoard() {
    if (!state) return;
    board.replaceChildren();
    document.querySelector("#game-title").textContent = { klondike: "Solitaire", freecell: "FreeCell", pyramid: "Pyramid" }[state.mode];
    document.querySelector("#move-count").textContent = `${state.moves} moves`;
    document.querySelector("#undo").disabled = !state.history.length;
    document.querySelector("#new-deal").disabled = false;
    board.className = `board ${state.mode}`;
    if (state.mode === "pyramid") renderPyramid();
    else renderColumns();
    if (state.outcome === "won") note("All clear. Beautifully played.");
    if (state.outcome === "stuck") note("No legal moves remain. Undo or start a new deal.");
  }
  function renderColumns() {
    const top = document.createElement("div"); top.className = "top-piles";
    if (state.mode === "klondike") {
      const stock = document.createElement("button"); stock.type = "button"; stock.className = `stock ${state.stock.length ? "down" : ""}`;
      stock.innerHTML = state.stock.length ? '<span class="back-mark" aria-hidden="true">✳</span>' : "↺";
      stock.setAttribute("aria-label", state.stock.length ? `Draw ${state.drawCount} from stock, ${state.stock.length} left` : "Recycle waste");
      stock.disabled = !canDraw(state); stock.onclick = () => commit({ type: "draw" }); top.append(stock);
      const waste = document.createElement("div"); waste.className = "pile";
      if (state.waste.length) waste.append(card(state.waste.at(-1), { zone: "waste" }, { active: same(selected, { zone: "waste" }) }));
      else waste.append(place("waste", null, "WASTE")); top.append(waste);
    } else {
      for (let i = 0; i < 4; i++) {
        const cell = document.createElement("div"); cell.className = "pile";
        const ref = { zone: "cell", index: i };
        cell.append(state.cells[i] == null ? place("cell", i, "FREE") : card(state.cells[i], ref, { active: same(selected, ref), target: highlight(ref) })); top.append(cell);
      }
    }
    const spacer = document.createElement("div"); spacer.className = "pile-spacer"; top.append(spacer);
    state.foundations.forEach((pile, index) => {
      const wrap = document.createElement("div"); wrap.className = "pile";
      const ref = { zone: "foundation", index };
      if (pile.length) wrap.append(card(pile.at(-1), ref, { active: same(selected, ref), target: highlight(ref) }));
      else wrap.append(place("foundation", index, SUITS[index]));
      top.append(wrap);
    });
    board.append(top);
    const columns = document.createElement("div"); columns.className = "columns";
    state.tableau.forEach((pile, index) => {
      const column = document.createElement("div"); column.className = "column";
      column.setAttribute("aria-label", `Column ${index + 1}`);
      if (!pile.length) column.append(place("tableau", index, "EMPTY"));
      pile.forEach((item, start) => {
        const id = idOf(item); const ref = { zone: "tableau", index, start };
        const wrap = document.createElement("div"); wrap.className = "stack-card";
        wrap.style.top = `${start * (state.mode === "klondike" ? 24 : 29)}px`;
        wrap.append(card(id, ref, { faceDown: item.up === false, active: same(selected, ref), target: highlight(ref) && start === pile.length - 1 }));
        column.append(wrap);
      });
      column.style.minHeight = `${Math.max(230, (pile.length - 1) * (state.mode === "klondike" ? 24 : 29) + 86)}px`;
      columns.append(column);
    }); board.append(columns);
  }
  function renderPyramid() {
    const pyramid = document.createElement("div"); pyramid.className = "pyramid-grid";
    for (let row = 0; row < 7; row++) {
      const line = document.createElement("div"); line.className = "pyramid-row";
      for (let column = 0; column <= row; column++) {
        const index = row * (row + 1) / 2 + column;
        const item = state.pyramid[index];
        const ref = { zone: "pyramid", index };
        const wrap = document.createElement("div"); wrap.className = "pyramid-slot";
        if (!item.removed) {
          wrap.append(card(item.id, ref, { faceDown: false, active: same(selected, ref), target: highlight(ref) }));
          if (!isExposed(state, index)) wrap.querySelector("button").disabled = true;
        }
        line.append(wrap);
      } pyramid.append(line);
    } board.append(pyramid);
    const stockRow = document.createElement("div"); stockRow.className = "pyramid-stock";
    const stock = document.createElement("button"); stock.type = "button"; stock.className = `stock ${state.stock.length ? "down" : ""}`;
    stock.innerHTML = state.stock.length ? '<span class="back-mark" aria-hidden="true">✳</span>' : "↺";
    stock.setAttribute("aria-label", state.stock.length ? `Draw from stock, ${state.stock.length} left` : "Recycle waste");
    stock.disabled = !canDraw(state); stock.onclick = () => commit({ type: "draw" }); stockRow.append(stock);
    const waste = document.createElement("div"); waste.className = "pile";
    const ref = { zone: "waste" };
    waste.append(state.waste.length ? card(state.waste.at(-1), ref, { active: same(selected, ref), target: highlight(ref) }) : place("waste", null, "WASTE"));
    stockRow.append(waste);
    const remaining = state.pyramid.filter((item) => !item.removed).length;
    const caption = document.createElement("p"); caption.textContent = `${remaining} cards to clear · ${state.maxRedeals - state.redeals} redeals left`;
    stockRow.append(caption); board.append(stockRow);
  }
  function home() {
    state = null; selected = null;
    root.dataset.screen = "home";
    note("");
    for (const mode of ["klondike", "freecell", "pyramid"]) {
      const saved = read(`${STORAGE}-${mode}`);
      const resume = document.querySelector(`[data-resume="${mode}"]`);
      resume.hidden = !saved;
      resume.textContent = saved?.outcome === "won" ? "View game" : "Resume";
    }
  }
  function start(mode, fresh = false) {
    state = fresh ? newGame(mode, prefs) : read(`${STORAGE}-${mode}`) ?? newGame(mode, prefs);
    selected = null; root.dataset.screen = "game"; save(); renderBoard();
    note("");
    if (!read(`${STORAGE}-taught-${mode}`)) tutorial(mode);
  }
  function tutorial(mode) {
    tutorialMode = mode; tutorialStep = 0; practiceSelected = false;
    renderTutorial();
  }
  function renderTutorial() {
    const names = { klondike: "Solitaire", freecell: "FreeCell", pyramid: "Pyramid" };
    const goals = {
      klondike: "Build four suit foundations from Ace to King. In the columns, stack alternating colors downward. Only Kings start empty columns.",
      freecell: "Build four suit foundations from Ace to King. Use four free cells to hold single cards while you arrange alternating-color runs.",
      pyramid: "Clear every card in the pyramid. Pair exposed cards totaling 13, or remove a King by itself.",
    };
    if (tutorialStep === 0) showDialog(`<p class="overline">${names[tutorialMode]} / 01 of 03</p><h2>How to play</h2><p>${goals[tutorialMode]}</p><div class="dialog-actions"><button id="tutorial-next" class="primary">Try a move →</button><button id="tutorial-skip">Skip</button></div>`);
    else if (tutorialStep === 1) {
      const pyramid = tutorialMode === "pyramid";
      showDialog(`<p class="overline">Practice / 02 of 03</p><h2>Tap, then place.</h2><p>${pyramid ? "Pair 8 with 5 to make 13." : "Move the Ace to its suit foundation."}</p><div class="practice"><button id="practice-card" class="card black"><span class="rank">${pyramid ? "8" : "A"}<small>♠</small></span><span class="pip">♠</span></button><button id="practice-target" class="place">${pyramid ? "5 ♥" : "♠"}</button></div><p id="practice-note">Tap the card on the left.</p><div class="dialog-actions"><button id="tutorial-skip">Skip</button></div>`);
      dialogContent.querySelector("#practice-card").onclick = () => { practiceSelected = true; dialogContent.querySelector("#practice-card").classList.add("selected"); dialogContent.querySelector("#practice-target").classList.add("target"); dialogContent.querySelector("#practice-note").textContent = "Now tap the highlighted target."; };
      dialogContent.querySelector("#practice-target").onclick = () => { if (!practiceSelected) return; tutorialStep = 2; renderTutorial(); };
    } else showDialog(`<p class="overline">Ready / 03 of 03</p><h2>Your turn.</h2><p>${tutorialMode === "pyramid" ? "Draw from the stock if you need a new card. The waste's top card can make a pair." : tutorialMode === "klondike" ? `Tap the stock to draw ${state?.drawCount ?? prefs.drawCount} card${(state?.drawCount ?? prefs.drawCount) === 1 ? "" : "s"}. Turn over a hidden column card by moving its cover.` : "Empty columns and free cells help you rearrange cards. Longer runs need enough open space."}</p><p>Use Hint whenever you need a nudge. Undo takes back a move.</p><div class="dialog-actions"><button id="tutorial-done" class="primary">Let's play</button></div>`);
    dialogContent.querySelector("#tutorial-next")?.addEventListener("click", () => { tutorialStep++; renderTutorial(); });
    dialogContent.querySelector("#tutorial-skip")?.addEventListener("click", finishTutorial);
    dialogContent.querySelector("#tutorial-done")?.addEventListener("click", finishTutorial);
  }
  function finishTutorial() { write(`${STORAGE}-taught-${tutorialMode}`, true); closeDialog(); }
  function rules() {
    const mode = state.mode;
    const text = mode === "klondike"
      ? `<li>Classic Solitaire (Klondike): build each foundation from Ace to King in one suit.</li><li>On the table, place a lower rank on a higher rank of the opposite color. Move ordered face-up runs together.</li><li>Only a King may enter an empty column. Exposing a face-down card turns it over.</li><li>Draw ${state.drawCount} card${state.drawCount === 1 ? "" : "s"} at a time. Only the top waste card can move. You may recycle the waste without a limit.</li>`
      : mode === "freecell"
      ? `<li>Build each foundation from Ace to King in one suit.</li><li>On the table, place a lower rank on a higher rank of the opposite color. Any card can start an empty column.</li><li>Each free cell holds one card. Ordered runs can move when enough free cells and empty columns are available.</li><li>The longest movable run is (open cells + 1) × 2 to the power of open columns, excluding an empty destination.</li>`
      : `<li>Remove exposed pairs that add up to 13. Kings remove on their own.</li><li>A pyramid card is exposed when no cards cover it. Only the top waste card is available for pairing.</li><li>Tap the stock to draw one card. ${state.maxRedeals ? "You may turn the waste over once." : "There are no redeals."}</li><li>Clear the pyramid to win. The stock and waste do not need to be empty.</li>`;
    showDialog(`<p class="overline">${mode} / rules</p><h2>Quick rules</h2><ol class="rule-list">${text}</ol><div class="dialog-actions"><button id="walkthrough" class="primary">Try walkthrough</button><button id="close-rules">Close</button></div>`);
    dialogContent.querySelector("#walkthrough").onclick = () => tutorial(mode);
    dialogContent.querySelector("#close-rules").onclick = closeDialog;
  }
  function settings() {
    showDialog(`<p class="overline">Make it yours</p><h2>Settings</h2><div class="settings-list">
      <label>Table surface<select id="theme"><option value="light">Paper</option><option value="dark">Ink</option></select></label>
      <label>Card back<select id="back"><option value="lines">Fine lines</option><option value="dots">Dots</option></select></label>
      <label>Reduced motion<input id="reduced" type="checkbox" /></label>
      <label>Klondike draw<select id="draw-count"><option value="1">Draw one</option><option value="3">Draw three</option></select></label>
      <label>Pyramid redeal<select id="redeals"><option value="0">No redeal</option><option value="1">One redeal</option></select></label>
    </div><p class="fine-print">Rule changes apply to the next new deal. Your current game keeps its original rules.</p><div class="dialog-actions"><button id="save-settings" class="primary">Save settings</button></div>`);
    for (const [id, value] of [["theme", prefs.theme], ["back", prefs.back], ["draw-count", prefs.drawCount], ["redeals", prefs.pyramidRedeals]]) dialogContent.querySelector(`#${id}`).value = String(value);
    dialogContent.querySelector("#reduced").checked = prefs.reducedMotion;
    dialogContent.querySelector("#save-settings").onclick = () => {
      prefs = { theme: dialogContent.querySelector("#theme").value, back: dialogContent.querySelector("#back").value, reducedMotion: dialogContent.querySelector("#reduced").checked, drawCount: Number(dialogContent.querySelector("#draw-count").value), pyramidRedeals: Number(dialogContent.querySelector("#redeals").value) };
      applyPrefs(); closeDialog(); if (state) renderBoard(); note("Settings saved.");
    };
  }
  function confirmNewDeal() {
    if (state.moves === 0 || state.outcome !== "playing") { start(state.mode, true); return; }
    showDialog(`<p class="overline">Start fresh</p><h2>New deal?</h2><p>Your current ${state.mode} game will be replaced.</p><div class="dialog-actions"><button id="confirm-new" class="primary">Deal new game</button><button id="cancel-new">Keep playing</button></div>`);
    dialogContent.querySelector("#confirm-new").onclick = () => { const mode = state.mode; closeDialog(); start(mode, true); };
    dialogContent.querySelector("#cancel-new").onclick = closeDialog;
  }
  document.querySelectorAll("[data-new]").forEach((button) => button.addEventListener("click", () => start(button.dataset.new, true)));
  document.querySelectorAll("[data-resume]").forEach((button) => button.addEventListener("click", () => start(button.dataset.resume)));
  document.querySelector("#all-games").onclick = home;
  document.querySelector("#new-deal").onclick = confirmNewDeal;
  document.querySelector("#undo").onclick = () => { const next = applyAction(state, { type: "undo" }); if (next !== state) { state = next; selected = null; save(); renderBoard(); note("Move undone."); } };
  document.querySelector("#hint").onclick = () => { const move = legalMoves(state).find((move) => move.type === "move" && move.to?.zone === "foundation") ?? legalMoves(state).find((move) => move.type === "move") ?? legalMoves(state)[0]; note(move ? describeMove(state, move) : "No moves remain. Try Undo or a new deal."); };
  document.querySelector("#rules").onclick = rules;
  document.querySelector("#settings").onclick = settings;
  dialog.querySelector("#dialog-close").onclick = closeDialog;
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
  applyPrefs(); home();
}
