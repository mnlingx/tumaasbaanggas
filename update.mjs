// update.mjs
// Kinukuha ang pinakabagong lingguhang adjustment ng DOE at isinusulat sa data.json.
// Kailangan: Node 18 pataas at ang environment variable na ANTHROPIC_API_KEY.

import { readFile, writeFile } from "node:fs/promises";

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) throw new Error("Walang ANTHROPIC_API_KEY. Ilagay ito sa GitHub Secrets.");

const MODEL = "claude-sonnet-5-5";
const MONTHS = ["Ene", "Peb", "Mar", "Abr", "May", "Hun", "Hul", "Ago", "Set", "Okt", "Nob", "Dis"];
const FUELS = ["gasoline", "diesel", "kerosene"];

// Petsa ngayon sa oras ng Pilipinas (UTC+8)
const todayISO = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);

const label = iso => {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
};

function weekLabel(iso) {
  const s = new Date(iso + "T00:00:00Z");
  const e = new Date(s.getTime() + 6 * 864e5);
  const [am, ad] = [s.getUTCMonth(), s.getUTCDate()];
  const [bm, bd, by] = [e.getUTCMonth(), e.getUTCDate(), e.getUTCFullYear()];
  return am === bm ? `${MONTHS[am]} ${ad}–${bd}, ${by}` : `${MONTHS[am]} ${ad}–${MONTHS[bm]} ${bd}, ${by}`;
}

const prompt = `Today is ${todayISO} (Philippine time). Use web search to find the Philippine Department of Energy's most recent weekly fuel price adjustments, per liter in pesos, for gasoline, diesel and kerosene. Rollbacks are negative numbers and increases are positive. Use the adjustment that took effect (or takes effect) on the most recent Tuesday, and give that Tuesday as weekStart. If the DOE has already published an estimate for the next Tuesday's adjustment (usually on Friday), include it as forecast, otherwise set forecast to null. Also pick up to 4 recent news articles about these adjustments from different Philippine outlets, each with the outlet name, your own short headline in Filipino (do not copy the article's title), and the article's real URL from your search results.

Reply with ONLY a JSON object and no other text, in exactly this shape:
{"weekStart":"YYYY-MM-DD","current":{"gasoline":0,"diesel":0,"kerosene":0},"forecast":null,"news":[{"source":"","title":"","url":""}]}
When forecast is not null it looks like {"date":"YYYY-MM-DD","gasoline":0,"diesel":0,"kerosene":0}.`;

async function ask() {
  const messages = [{ role: "user", content: prompt }];
  for (let i = 0; i < 4; i++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
        messages,
      }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (data.stop_reason !== "pause_turn") {
      return data.content.filter(b => b.type === "text").map(b => b.text).join("");
    }
    messages.push({ role: "assistant", content: data.content });
  }
  throw new Error("Masyadong mahaba ang paghahanap.");
}

const text = await ask();
const a = text.indexOf("{");
const b = text.lastIndexOf("}");
if (a < 0 || b < 0) throw new Error("Walang JSON sa sagot:\n" + text);
const raw = JSON.parse(text.slice(a, b + 1));

// --- Pagsusuri: huwag isulat ang kakaibang datos ---
const ok = n => typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= 25;
if (!FUELS.every(k => ok(raw.current?.[k]))) {
  throw new Error("Hindi tama ang mga numero: " + JSON.stringify(raw.current));
}
const ageDays = (Date.parse(todayISO) - Date.parse(raw.weekStart)) / 864e5;
if (!(ageDays >= -1 && ageDays <= 9)) {
  throw new Error("Luma o kakaiba ang petsa: " + raw.weekStart);
}

let old = {};
try { old = JSON.parse(await readFile("data.json", "utf8")); } catch {}

const f = raw.forecast;
const forecast = f && FUELS.every(k => ok(f[k])) && f.date > todayISO
  ? { date: label(f.date), gasoline: f.gasoline, diesel: f.diesel, kerosene: f.kerosene }
  : null;

const news = (raw.news || [])
  .filter(n => n && n.title && n.source && /^https:\/\//.test(n.url))
  .slice(0, 4)
  .map(({ source, title, url }) => ({ source, title, url }));

const out = {
  updated: `${label(todayISO)}, ${todayISO.slice(0, 4)}`,
  week: weekLabel(raw.weekStart),
  headlineFuel: old.headlineFuel || "gasoline",
  current: Object.fromEntries(FUELS.map(k => [k, raw.current[k]])),
  forecast,
  news: news.length ? news : old.news || [],
};

await writeFile("data.json", JSON.stringify(out, null, 2) + "\n");
console.log("Na-update ang data.json:\n", JSON.stringify(out, null, 2));
