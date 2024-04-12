const initial = "D";

const values = [
  ["a", 241],
  ["n", 417],
  ["i", 601],
  ["e", 734],
  ["l", 878],
  [" ", 1065],
  ["W", 1268],
  ["e", 1493],
  ["s", 1716],
  ["t", 1830],
  ["b", 2037],
  ["r", 2080],
  ["o", 2207],
  ["o", 2396],
  ["k", 2660],
];

const complete = values.reduce((txt, [char]) => txt + char, initial);
const completeTime = values.reduce((n, [, t]) => n + t, 0);

let done = false;

htmx.onLoad(() => {
  if (window.location.pathname !== "/") return;

  let start, previous;

  /** @type {HTMLElement} **/
  const logo = document.getElementById("logo");
  /** @type {HTMLElement} **/
  const shape = document.querySelector(".shape");

  if (!logo) throw new Error("#logo not found");
  if (!shape) throw new Error(".shape not found");

  if (!done) {
    logo.textContent = initial;
  } else {
    logo.textContent = complete;
  }

  /** @type {(elapsed: number) => void} **/
  function type(elapsed) {
    logo.textContent = values.reduce((txt, [char, t]) => {
      if (elapsed > t) txt += char;
      return txt;
    }, initial);

    if (logo.textContent === complete) {
      done = true;
    }
  }

  /** @type {(elapsed: number) => void} **/
  function blink(elapsed) {
    const t = elapsed - completeTime + 100;
    shape.style.opacity = Math.floor(t / 700) % 2 ? 1 : 0;
  }

  /** @type {(delta: number) => void} **/
  function frame(timestamp) {
    if (start == undefined) start = timestamp;
    const elapsed = timestamp - start;

    if (previous != timestamp) {
      if (done) {
        blink(elapsed);
      } else {
        type(elapsed);
      }
    }

    previous = timestamp;

    if (window.location.pathname === "/") {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
});
