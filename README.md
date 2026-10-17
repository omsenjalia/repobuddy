# 🧭 RepoBuddy

Paste a GitHub repo → **Graphify** maps it into a knowledge graph → **Gemma 4** tells you where to start, how it's built, and what to contribute first.

Built at Hacktoberfest Hack Day Vadodara × NavraCommunity (17 Oct 2026).

## Built with
- **Gemma 4** (open-weight) via the Gemini API, with **Ollama Cloud** (`gemma4:31b`) as fallback
- **[Graphify](https://github.com/Graphify-Labs/graphify)** (OSS) for repository mapping and graph queries
- **Next.js** static site and **Pages Functions** on Cloudflare Pages, plus an optional **FastAPI** server

## How it works
RepoBuddy has two backends; the website picks one at build time with `NEXT_PUBLIC_BACKEND`.

**Beta (`cloud`, default): everything on Cloudflare Pages.** Pages Functions in `functions/` ask **Graphify Cloud** (hosted MCP) for the relevant slice of the graph, then Gemma 4 answers from it. It only knows repos indexed in the admin's Graphify workspace (3 on the free plan).

**Production (`server`): the FastAPI server in `server/`.** It shallow-clones any public repo, runs `graphify extract` locally (tree-sitter, no API cost), and answers from `graphify query` subgraphs. It also serves the interactive graph. It needs `git` and real processes, so it runs on a VPS or Render, not Pages.

## Run locally
Needs Node 20+ (and for server mode: Git and Python 3.12).

**Beta (Pages + Graphify Cloud).** Put secrets in `.dev.vars` (git-ignored):
```
GEMINI_API_KEY=your-key
OLLAMA_API_KEY=your-key
ADMIN_SECRET=any-long-random-string
```
```bash
npm install
```
```bash
npm run build
```
```bash
npx wrangler pages dev out --kv GRAPHIFY_KV --port 8788 --compatibility-date 2026-09-01
```
Open http://localhost:8788/api/admin/connect, enter `ADMIN_SECRET`, and sign in to Graphify once. Then open http://localhost:8788/app.

**Server mode.** Put `GEMINI_API_KEY` and `OLLAMA_API_KEY` in `.env.local`, then:
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
python -m uvicorn main:app --app-dir server --port 8000 --env-file .env.local
```
In a second terminal (Windows PowerShell):
```bash
$env:NEXT_PUBLIC_BACKEND = "server"; npm run dev
```
Open http://localhost:3000. Tests: `cd server && python test_main.py`.

## Deploy the beta (Cloudflare Pages)
1. Index the repos you want in [app.graphify.com](https://app.graphify.com) and wait for **Indexed**.
2. Cloudflare dashboard → **Storage & Databases → KV** → create a namespace, e.g. `repobuddy-graphify`.
3. **Workers & Pages → Create → Pages → Connect to Git** → pick this repo. Framework preset **None**, build command `npm run build`, output directory `out`.
4. In the project's **Settings**:
   - **Variables and Secrets**: secrets `GEMINI_API_KEY`, `OLLAMA_API_KEY`, `ADMIN_SECRET`; variable `NODE_VERSION` = `20`.
   - **Bindings**: KV namespace, variable name `GRAPHIFY_KV`, the namespace from step 2.
   - **Runtime**: compatibility date `2026-09-01` or later.
5. Redeploy, then open `https://<your-site>/api/admin/connect`, enter `ADMIN_SECRET` and sign in to Graphify. The session is stored in KV and refreshes itself; if it ever expires, `/app` says so and you repeat this step.

## Switch to server mode (VPS or Render)
1. Run the API: on a VPS, `docker build -t repobuddy-api server` then `docker run -d -p 8000:8000 --env-file .env repobuddy-api` behind HTTPS. On Render, **New → Blueprint** with this repo uses `render.yaml`. Set `GEMINI_API_KEY`, `OLLAMA_API_KEY` and `ALLOWED_ORIGINS` (your site's URL).
2. In Cloudflare Pages, set variables `NEXT_PUBLIC_BACKEND` = `server` and `NEXT_PUBLIC_API_URL` = the API URL (no trailing slash), then redeploy.

Render's free plan sleeps after 15 minutes idle (30-60s cold start), wipes its disk on sleep (the site re-maps automatically) and has 512 MB RAM.

Fallback: if the Gemini call fails, RepoBuddy asks Gemma 4 on Ollama Cloud (keys at https://ollama.com/settings/keys). Override with `OLLAMA_MODEL` (default `gemma4:31b`). Optional: `GEMMA_MODEL` and `NEXT_PUBLIC_GEMMA_MODEL` (label in the UI).

## License
MIT. See [LICENSE](LICENSE).
