# Tumaas ba ang gas?

**Live site** · [tumaasbaanggas.com](https://tumaasbaanggas.com)

## Purpose

Help people in the Philippines quickly see whether fuel prices rose or fell this week and how much the change will affect their next fill-up.

## Scope

The site covers weekly per-liter price adjustments for gasoline, diesel, and kerosene in the Philippines. It also shows the next adjustment forecast when available and links to news coverage. The figures are price changes, so pump prices still depend on the station and location.

## Target audience

Drivers, motorcycle riders, and other fuel buyers in the Philippines who want a quick, Filipino-language summary of the latest price changes.

## Run locally

From the repository root, start a local server with Python 3:

```sh
python3 -m http.server --bind 127.0.0.1 8000
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). The site uses plain HTML, CSS, and JavaScript and loads the checked-in [data.json](data.json). Previewing it requires no build step or API key.

## Refresh fuel data

The updater uses Node.js 20 in GitHub Actions. To run it locally, copy [.env.example](.env.example) to `.env` and set `OPENAI_API_KEY` in that file.

```sh
node update.mjs
```

[update.mjs](update.mjs) uses OpenAI web search to find fuel price reports, validates the adjustments and dates, and writes the results to `data.json`. Review the changes with `git diff -- data.json`.

The [Update fuel data workflow](.github/workflows/update.yml) runs on a schedule and can also be triggered manually from the repository’s Actions tab. It uses the repository secret `OPENAI_API_KEY` and commits and pushes `data.json` when the file changes.


## Search engine optimization

The homepage title and description identify the site and its coverage. Each page declares its canonical URL on the live domain. The [robots.txt](robots.txt) file points crawlers to the [sitemap](sitemap.xml). If a page is added or moved, update its canonical URL and the sitemap.
