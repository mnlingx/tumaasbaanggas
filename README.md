# Tumaas ba ang gas?

A site for checking weekly fuel price adjustments in the Philippines. It shows how much gasoline, diesel, and kerosene prices changed per liter, along with a forecast when available and links to news coverage.

**Live site** · [tumaasbaanggas.com](https://tumaasbaanggas.com)

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
