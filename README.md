# 🧭 RepoBuddy

Paste a GitHub repo → **Graphify** maps it into a knowledge graph → **Gemma 4** tells you where to start, how it's built, and what to contribute first.

Built at Hacktoberfest Hack Day Vadodara × NavraCommunity (17 Oct 2026).

## Built with
- **Gemma 4** (open-weight) via the Gemini API, with **Ollama Cloud** (`gemma4:31b`) as fallback
- **[Graphify](https://github.com/Graphify-Labs/graphify)** (OSS) for repository mapping and graph queries
- **Next.js** static site on Cloudflare Pages, **FastAPI** server on Render

## How it works
1. Shallow-clones the repo you paste.
2. `graphify extract` builds a code knowledge graph locally (tree-sitter, no API cost).
3. Each question runs `graphify query` for a scoped subgraph, and Gemma 4 answers from it, citing real file paths.

## Layout
One repo, two deploys:
- **Website** (repo root): Next.js built as static files (`output: "export"`) for **Cloudflare Pages**.
- **API** (`server/`): FastAPI that clones repos, runs Graphify and asks Gemma 4. Deployed to **Render** (free) with Docker; it needs `git` and real processes, which Cloudflare Pages can't run.

## Run locally
Needs Node 20+, Git and Python 3.12.
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r server/requirements.txt
npm install
```
Put keys in `.env.local` (git-ignored):
```
GEMINI_API_KEY=your-key
OLLAMA_API_KEY=your-key
```
Start both halves in two terminals:
```bash
python -m uvicorn main:app --app-dir server --port 8000 --env-file .env.local
```
```bash
npm run dev
```
Open http://localhost:3000. Tests: `cd server && python test_main.py`.

## Deploy
**1. API on Render**
1. Render dashboard → **New → Blueprint** → pick this GitHub repo. It reads `render.yaml`.
2. Fill in the secrets it asks for: `GEMINI_API_KEY`, `OLLAMA_API_KEY`, and `ALLOWED_ORIGINS` (your Pages URL, e.g. `https://repobuddy.pages.dev`; comma-separate several).
3. Note the service URL, e.g. `https://repobuddy-api.onrender.com`. Check `/health` returns `{"ok":true}`.

**2. Website on Cloudflare Pages**
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick this repo.
2. Framework preset **None**. Build command `npm run build`, output directory `out`.
3. Environment variable `NEXT_PUBLIC_API_URL` = your Render URL (no trailing slash). Add `NODE_VERSION` = `20` if the build picks an older Node.
4. Deploy, then put the `*.pages.dev` URL (and any custom domain) in Render's `ALLOWED_ORIGINS`.

Free-tier notes: Render sleeps after 15 minutes idle, so the first request after that takes 30-60s. Its disk is wiped on sleep; the site re-maps the repo automatically when that happens. It has 512 MB RAM, so very large repos may fail to map.

Fallback: if the Gemini call fails, RepoBuddy asks Gemma 4 on Ollama Cloud (keys at https://ollama.com/settings/keys). Override with `OLLAMA_MODEL` (default `gemma4:31b`). Optional: `GEMMA_MODEL` (API) and `NEXT_PUBLIC_GEMMA_MODEL` (label in the UI).

## License
MIT. See [LICENSE](LICENSE).
