const display = document.getElementById("display");
const keys = document.querySelector(".keys");
const clearBtn = document.querySelector(".clear");

let current = "0";      // number being typed
let previous = null;    // stored left-hand number
let operator = null;    // "+", "−", "×", "/"
let justEvaluated = false;
let error = false;

function compute(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "/": return b === 0 ? NaN : a / b;
  }
  return b;
}

function format(value) {
  if (!Number.isFinite(value)) return null;
  return String(parseFloat(value.toPrecision(10)));
}

function render(text = current) {
  display.textContent = text;
  const len = text.length;
  display.style.fontSize = len > 10 ? "1.8rem" : len > 7 ? "2.4rem" : "3.4rem";

  document.querySelectorAll("[data-op]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.op === operator && current === "");
  });
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  justEvaluated = false;
  error = false;
  render();
}

function showError() {
  clearAll();
  error = true;
  render("Error");
}

function startFresh() {
  if (error) clearAll();
  if (justEvaluated) {
    current = "0";
    justEvaluated = false;
  }
}

function inputDigit(d) {
  startFresh();
  if (current === "0" || current === "") current = d;
  else if (current.replace(/[-.]/g, "").length < 10) current += d;
  render();
}

function inputDecimal() {
  startFresh();
  if (current === "") current = "0";
  if (!current.includes(".")) current += ".";
  render();
}

function chooseOperator(op) {
  if (error) return;
  justEvaluated = false;

  if (previous !== null && operator && current !== "") {
    // chain: 2 + 3 × ... evaluates 2 + 3 first
    const result = format(compute(parseFloat(previous), parseFloat(current), operator));
    if (result === null) return showError();
    previous = result;
  } else if (current !== "") {
    previous = current;
  }

  operator = op;
  current = "";
  render(previous);
}

function equals() {
  if (error || operator === null || previous === null || current === "") return;
  const result = format(compute(parseFloat(previous), parseFloat(current), operator));
  if (result === null) return showError();
  current = result;
  previous = null;
  operator = null;
  justEvaluated = true;
  render();
}

function deleteLast() {
  if (error) return clearAll();
  if (justEvaluated || current === "") return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  render();
}

/* ---------- mouse / touch ---------- */
keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.digit !== undefined) inputDigit(btn.dataset.digit);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else if (btn.dataset.action === "decimal") inputDecimal();
  else if (btn.dataset.action === "equals") equals();
});

clearBtn.addEventListener("click", clearAll);

/* ---------- keyboard ---------- */
const opMap = { "+": "+", "-": "−", "*": "×", "/": "/" };

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputDigit(e.key);
  else if (e.key === ".") inputDecimal();
  else if (opMap[e.key]) { e.preventDefault(); chooseOperator(opMap[e.key]); }
  else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
  else if (e.key === "Backspace") deleteLast();
  else if (e.key === "Escape" || e.key.toLowerCase() === "c") clearAll();
});

render();