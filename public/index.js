let currentTimeout;
let currentInterval;

htmx.onLoad(() => {
  if (window.location.pathname !== "/") return;
  if (currentInterval) clearInterval(currentInterval);
  if (currentTimeout) clearTimeout(currentTimeout);

  let s = "";
  const chars = "Daniel Westbrook".split("").reduce((acc, c) => {
    if (c.trim() === "") s = c;
    else acc.push(s + c) && (s = "");
    return acc;
  }, []);

  const h = document.querySelector("h1");
  const c = document.querySelector("#cursor");

  currentTimeout = setTimeout(() => {
    currentInterval = setInterval(() => {
      h.innerText += chars.shift();
      if (chars.length == 0) {
        clearInterval(currentInterval);
        setInterval(() => (c.hidden = !c.hidden), 700);
      }
    }, 80);
  }, 400);
});
