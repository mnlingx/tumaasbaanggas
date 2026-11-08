// update.mjs
// Kinukuha ang pinakabagong lingguhang adjustment ng DOE at isinusulat sa data.json.
// Kailangan: Node 18 pataas at ang environment variable na OPENAI_API_KEY.

import { readFile, writeFile } from "node:fs/promises";

async function loadLocalEnv() {
  let text = "";
  try { text = await readFile(".env", "utf8"); } catch { return; }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

await loadLocalEnv();

const API_KEY = (process.env.OPENAI_API_KEY || (process.env.SELF_TEST ? "test" : "")).trim();
if (!API_KEY) throw new Error("Walang OPENAI_API_KEY. Ilagay ito sa .env locally or GitHub Secrets in deployment.");

const MODEL = "gpt-4o-mini";
const DATA_FILE = process.env.DATA_FILE || "data.json";
const TRUSTED_DOMAINS = [
  "doe.gov.ph", "gmanetwork.com", "inquirer.net", "philstar.com",
  "rappler.com", "mb.com.ph", "abs-cbn.com", "manilatimes.net",
  "tribune.net.ph", "bworldonline.com", "businessmirror.com.ph",
  "powerphilippines.com", "topgear.com.ph", "pna.gov.ph", "sunstar.com.ph",
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FUELS = ["gasoline", "diesel", "kerosene"];

// Petsa ngayon sa oras ng Pilipinas (UTC+8)
const todayISO = process.env.TODAY_ISO || new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);

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

function canonicalNewsUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.hostname = url.hostname.replace(/^www\./, "").replace(/^qa\./, "");
    url.pathname = url.pathname.replace(/\/amp\/?$/, "").replace(/\/$/, "");
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function trustedNewsUrl(rawUrl) {
  try {
    const host = new URL(rawUrl).hostname.replace(/^www\./, "").replace(/^qa\./, "");
    return TRUSTED_DOMAINS.some(domain => host === domain || host.endsWith("." + domain));
  } catch {
    return false;
  }
}

if (process.env.SELF_TEST) {
  console.assert(
    canonicalNewsUrl("https://qa.philstar.com/business/story/amp/") === "https://philstar.com/business/story",
    "canonicalNewsUrl removes qa host and amp suffix"
  );
  process.exit(0);
}

const prompt = `Today is ${todayISO} (Philippine time). Use web search to find the Philippine Department of Energy's most recent weekly fuel price adjustments, per liter in pesos, for gasoline, diesel and kerosene. Rollbacks are negative numbers and increases are positive. Use the adjustment that took effect (or takes effect) on the most recent Tuesday, and give that Tuesday as weekStart. Search separately for a forecast or estimate for the next Tuesday's adjustment from DOE, GMA, PNA, or another trusted Philippine outlet; these forecasts are often reported on Thursday, Friday, Saturday, or Sunday before the Tuesday adjustment. If a reliable forecast exists, include it as forecast with the next Tuesday's date and negative numbers for rollbacks; otherwise set forecast to null. Also pick up to 4 recent news articles about these adjustments from different Philippine outlets in these trusted domains only: ${TRUSTED_DOMAINS.join(", ")}. Include the outlet name, your own short headline in Filipino (do not copy the article's title), and the article's real URL from your search results.

Reply with ONLY a JSON object and no other text, in exactly this shape:
{"weekStart":"YYYY-MM-DD","current":{"gasoline":0,"diesel":0,"kerosene":0},"forecast":null,"news":[{"source":"","title":"","url":""}]}
When forecast is not null it looks like {"date":"YYYY-MM-DD","gasoline":0,"diesel":0,"kerosene":0}.`;

async function ask() {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input: prompt,
      max_output_tokens: 2000,
      tools: [{ type: "web_search_preview" }],
    }),
  });
  if (!res.ok) {
    const details = await res.text();
    if (res.status === 401) {
      throw new Error("Hindi tinanggap ng OpenAI ang OPENAI_API_KEY. Palitan ang GitHub Secret ng isang aktibo at valid na OpenAI API key.");
    }
    throw new Error(`API error ${res.status}: ${details}`);
  }
  const data = await res.json();
  if (typeof data.output_text === "string") return data.output_text;
  const text = (data.output || [])
    .flatMap(item => item.content || [])
    .filter(item => item.type === "output_text")
    .map(item => item.text)
    .join("");
  if (!text) throw new Error("Walang text na sagot mula sa OpenAI.");
  return text;
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
try { old = JSON.parse(await readFile(DATA_FILE, "utf8")); } catch {}

const f = raw.forecast;
const forecast = f && FUELS.every(k => ok(f[k])) && f.date > todayISO
  ? { date: label(f.date), gasoline: f.gasoline, diesel: f.diesel, kerosene: f.kerosene }
  : null;

const seenNews = new Set();
const news = (raw.news || [])
  .filter(n => n && n.title && n.source && /^https:\/\//.test(n.url) && trustedNewsUrl(n.url))
  .filter(n => {
    const key = canonicalNewsUrl(n.url) || n.title.trim().toLowerCase();
    if (seenNews.has(key)) return false;
    seenNews.add(key);
    return true;
  })
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

await writeFile(DATA_FILE, JSON.stringify(out, null, 2) + "\n");
console.log(`Na-update ang ${DATA_FILE}:\n`, JSON.stringify(out, null, 2));
