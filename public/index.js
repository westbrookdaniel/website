let currentTimeout;

const charTypeSpeeds = [200, 100, 150, 90, 80, 75, 160, 180, 170, 110, 80, 75, 70, 70, 70];

htmx.onLoad(() => {
  if (window.location.pathname !== "/") return;
  if (currentTimeout) clearTimeout(currentTimeout);

  let s = "";
  const chars = "Daniel Westbrook".split("").reduce((acc, c) => {
    if (c.trim() === "") s = c;
    else acc.push(s + c) && (s = "");
    return acc;
  }, []);

  const h = document.querySelector("h1");
  const c = document.querySelector("#cursor");

  h.innerText = "";

  currentTimeout = setTimeout(() => {
    function type() {
      const charIndex = h.innerText.length % charTypeSpeeds.length;
      setTimeout(() => {
        h.innerText += chars.shift();
        if (chars.length == 0) {
          setInterval(() => (c.hidden = !c.hidden), 700);
        } else {
          type();
        }
      }, charTypeSpeeds[charIndex]);
    }
    currentTimeout = type();
  }, 400);
});
