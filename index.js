/* Pang-backup lang ito. Ang tunay na datos ay galing sa data.json, na ina-update ng script. */
const FALLBACK = {
  updated: "Nov 7, 2026",
  week: "Nov 3–9, 2026",
  headlineFuel: "gasoline",
  current: { gasoline: 3.50, diesel: -1.00, kerosene: -1.90 },
  forecast: { date: "Nov 10", gasoline: -14, diesel: -5, kerosene: -5.20 },
  news: [
    { source: "Rappler", title: "Tataas ang gasolina sa Nob 3; bababa ang diesel at kerosene", url: "https://www.rappler.com/business/fuel-prices-adjustments-november-4-2026/" },
    { source: "GMA News", title: "Gasolina pataas, diesel at kerosene pababa ngayong linggo", url: "https://www.gmanetwork.com/news/money/economy/1007990/gasoline-pump-prices-up-diesel-and-kerosene-down-november-3-2026/story/" },
    { source: "BusinessMirror", title: "DOE: mixed ang galaw ng presyo, may rollback ang diesel at kerosene", url: "https://businessmirror.com.ph/2026/11/02/gas-price-up-diesel-kerosene-down-this-week/" },
    { source: "GMA News", title: "Malaking rollback, tinatayang mangyayari sa susunod na linggo", url: "https://www.gmanetwork.com/news/money/economy/1008494/pump-price-rollbacks-of-up-to-p14-per-liter-seen-next-week/story/" }
  ]
};

const NAMES = { gasoline: "Gasolina", diesel: "Diesel", kerosene: "Kerosene" };
const peso = n => "₱" + Math.abs(n).toFixed(2);
const sign = n => (n > 0 ? "+" : n < 0 ? "−" : "");
const state = n => (n > 0 ? "up" : n < 0 ? "down" : "same");
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function render(DATA) {
  const head = DATA.current[DATA.headlineFuel];
  const isUp = head > 0;
  const answer = document.getElementById("answer");
  answer.textContent = isUp ? "OO" : "HINDI";
  answer.className = "answer " + (isUp ? "up" : "down");

  const board = document.getElementById("board");
  board.replaceChildren();
  Object.keys(NAMES).forEach(k => {
    const v = DATA.current[k];
    const c = el("div", "cell " + state(v));
    c.appendChild(el("p", "fuel", NAMES[k]));
    c.appendChild(el("p", "amt", sign(v) + peso(v)));
    board.appendChild(c);
  });

  const f = DATA.forecast;
  const next = document.getElementById("next");
  next.replaceChildren();
  next.hidden = !f;
  if (f) {
    const heading = el("h2", "", "Sa susunod na Martes, " + f.date);
    heading.appendChild(document.createTextNode(": estimate lang"));
    next.appendChild(heading);
    next.appendChild(el("p", "",
      "Gasolina " + sign(f.gasoline) + peso(f.gasoline) + ", diesel " + sign(f.diesel) + peso(f.diesel) +
      ", kerosene " + sign(f.kerosene) + peso(f.kerosene) +
      " kada litro, according sa unang apat na araw ng oil trading. Hindi pa ito final; hintayin ang announcement ng DOE sa Lunes."));
  }

  const ul = document.getElementById("news");
  ul.replaceChildren();
  DATA.news.forEach(n => {
    const li = el("li");
    const a = el("a", "", n.title);
    a.href = n.url; a.target = "_blank"; a.rel = "noopener noreferrer";
    li.appendChild(a);
    li.appendChild(el("span", "", n.source));
    ul.appendChild(li);
  });

  document.getElementById("foot-update").textContent =
    "Last updated: " + DATA.updated + ". Data mula sa DOE at mga ulat ng balita. Hindi ito official na website ng gobyerno.";
}

const qrModal = document.getElementById("qr-modal");
const qrModalClose = document.getElementById("qr-modal-close");
const qrModalTitle = document.getElementById("qr-modal-title");
const qrModalImage = document.getElementById("qr-modal-image");
function openQrModal(title, src) {
  qrModalTitle.textContent = title;
  qrModalImage.src = src;
  qrModalImage.alt = title + " QR code";
  qrModal.hidden = false;
  qrModalClose.focus();
}
function closeQrModal() {
  qrModal.hidden = true;
  qrModalImage.removeAttribute("src");
}
qrModalClose.addEventListener("click", closeQrModal);
qrModal.addEventListener("click", event => {
  if (event.target === qrModal) closeQrModal();
});
document.querySelectorAll("[data-qr-src]").forEach(button => {
  button.addEventListener("click", () => openQrModal(button.dataset.qrTitle, button.dataset.qrSrc));
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !qrModal.hidden) closeQrModal();
});

async function loadData() {
  let data;
  try {
    const response = await fetch("data.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Request failed with status " + response.status);
    data = await response.json();
  } catch (error) {
    console.error("Could not load data.json; showing fallback data.", error);
    data = FALLBACK;
  }
  render(data);
}

loadData();
