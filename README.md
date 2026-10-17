# 🧭 RepoBuddy

Paste a GitHub repo → **Graphify** maps it into a knowledge graph → **Gemma 4** tells you where to start, how it's built, and what to contribute first.

Built at Hacktoberfest Hack Day Vadodara × NavraCommunity (17 Oct 2026).

## Built with
- **Gemma 4** (open-weight) via the Gemini API, with **Ollama Cloud** (`gemma4:31b`) as fallback
- **[Graphify](https://github.com/Graphify-Labs/graphify)** (OSS) for repository mapping and graph queries
- **Next.js** (one app: React UI + API routes)

## How it works
1. Shallow-clones the repo you paste.
2. `graphify extract` builds a code knowledge graph locally (tree-sitter, no API cost).
3. Each question runs `graphify query` for a scoped subgraph, and Gemma 4 answers from it, citing real file paths.

## Setup
Needs Node 20+, Git and Python (for Graphify).
```bash
python -m venv .venv
.venv\Scripts\activate
pip install graphifyy
npm install
set GEMINI_API_KEY=your-key
npm run dev
```
Open http://localhost:3000. Demo repo: `https://github.com/pallets/click`

Fallback: if the Gemini call fails, RepoBuddy asks Gemma 4 on Ollama Cloud. Create a key at https://ollama.com/settings/keys and `set OLLAMA_API_KEY=your-key`. Override with `OLLAMA_MODEL` (default `gemma4:31b`).

Optional: set `GEMMA_MODEL` (server) and `NEXT_PUBLIC_GEMMA_MODEL` (label in the UI) to pick a different Gemma 4 variant.

## License
MIT. See [LICENSE](LICENSE).
