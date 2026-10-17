# 🧭 RepoBuddy

Paste a GitHub repo → **Graphify** maps it into a knowledge graph → **Gemma 4** tells you where to start, how it's built, and what to contribute first.

Built at Hacktoberfest Hack Day Vadodara × NavraCommunity (17 Oct 2026).

## Built with
- **Gemma 4** (open-weight) via the Gemini API, with **Ollama Cloud** (`gemma4:31b`) as fallback
- **[Graphify](https://github.com/Graphify-Labs/graphify)** (OSS) for repository mapping and graph queries
- **Next.js** static site and **Pages Functions** on Cloudflare Pages, and a **FastAPI** server on Render

## How it works
RepoBuddy has two backends; the website picks one at build time with `NEXT_PUBLIC_BACKEND`.

**Server (default).** The FastAPI app in `server/` shallow-clones any public repo, runs `graphify extract` locally (tree-sitter, no API cost), answers from `graphify query` subgraphs with Gemma 4, and serves the interactive graph. It needs `git` and real processes, so it runs on Render (or any VPS), while the website is static on Cloudflare Pages.

**Beta (`cloud`).** Everything on Cloudflare Pages: Pages Functions in `functions/` ask Graphify Cloud (hosted MCP) for the relevant slice of the graph. Only repos indexed in the admin's Graphify workspace work. See [Graphify Cloud mode](#graphify-cloud-mode).

## Run locally
Needs Node 20+, Git and Python 3.12. Put `GEMINI_API_KEY` and `OLLAMA_API_KEY` in `.env.local` (git-ignored), then:
```bash
python -m venv .venv
```
```bash
.venv\Scripts\activate
```
```bash
pip install -r server/requirements.txt
```
```bash
npm install
```
Start the API and the website in two terminals:
```bash
python -m uvicorn main:app --app-dir server --port 8000 --env-file .env.local
```
```bash
npm run dev
```
Open http://localhost:3000. Tests: `cd server && python test_main.py`.

## Deploy
**What goes where:** Render runs only `server/` (the API). Cloudflare Pages builds the repo root into static files (`out/`); its `functions/` folder deploys too but is unused in server mode.

**1. API on Render**
1. Render dashboard → **New → Blueprint** → connect this GitHub repo. It reads `render.yaml`: a **free** web service built from `server/Dockerfile`.
2. Enter the secrets it asks for: `GEMINI_API_KEY`, `OLLAMA_API_KEY`, and `ALLOWED_ORIGINS` (e.g. `https://repobuddy.pages.dev`; comma-separate several, add your custom domain later).
3. When it's live, open `https://<service>.onrender.com/health`; it should return `{"ok":true}`.

The free plan sleeps after 15 minutes idle (the first request then takes 30-60s), wipes cloned repos on sleep (the site re-maps automatically) and has 512 MB RAM, so very large repos may fail to map. With billing or credits active, follow the comments in `render.yaml`: switch `plan` to `starter` and uncomment the disk and `WORK_DIR`, so the service stays awake and keeps its clones.

**2. Website on Cloudflare Pages**
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → this repo.
2. Framework preset **None**, build command `npm run build`, output directory `out`.
3. Variables: `NEXT_PUBLIC_API_URL` = your Render URL (no trailing slash), `NODE_VERSION` = `20`.
4. Deploy. If the `*.pages.dev` URL differs from what you put in `ALLOWED_ORIGINS`, update it on Render.

Fallback: if the Gemini call fails, RepoBuddy asks Gemma 4 on Ollama Cloud (keys at https://ollama.com/settings/keys). Override with `OLLAMA_MODEL` (default `gemma4:31b`). Optional: `GEMMA_MODEL` and `NEXT_PUBLIC_GEMMA_MODEL` (label in the UI).

## Graphify Cloud mode
The beta backend, kept for when you don't run the server.
1. Index repos in [app.graphify.com](https://app.graphify.com) and wait for **Indexed**.
2. Cloudflare **Storage & Databases → KV** → create a namespace.
3. In the Pages project: variable `NEXT_PUBLIC_BACKEND` = `cloud`; secrets `GEMINI_API_KEY`, `OLLAMA_API_KEY`, `ADMIN_SECRET`; **Bindings** → KV namespace named `GRAPHIFY_KV`; compatibility date `2026-09-01` or later.
4. Redeploy, open `https://<your-site>/api/admin/connect`, enter `ADMIN_SECRET` and sign in to Graphify. The session refreshes itself from KV.

Locally: put the same three secrets in `.dev.vars`, then `$env:NEXT_PUBLIC_BACKEND = "cloud"; npm run build` and `npx wrangler pages dev out --kv GRAPHIFY_KV --port 8788 --compatibility-date 2026-09-01`.

## License
MIT. See [LICENSE](LICENSE).
