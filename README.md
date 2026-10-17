# 🧭 RepoBuddy

Paste a GitHub repo → **Graphify** maps it into a knowledge graph → **Gemma 4** tells you where to start, how it's built, and what to contribute first.

Built at Hacktoberfest Hack Day Vadodara × NavraCommunity (17 Oct 2026).

## Built with
- **Gemma 4** (open-weight) via the Gemini API
- **[Graphify](https://github.com/Graphify-Labs/graphify)** (OSS) for repository mapping and graph queries
- **Streamlit**

## How it works
1. Shallow-clones the repo you paste.
2. `graphify extract` builds a code knowledge graph locally (tree-sitter, no API cost).
3. Each question runs `graphify query` for a scoped subgraph, and Gemma 4 answers from it, citing real file paths.

## Setup
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set GEMINI_API_KEY=your-key
streamlit run app.py
```
Demo repo: `https://github.com/pallets/click`

Optional: `set GEMMA_MODEL=<model id>` to pick a different Gemma 4 variant.

## License
MIT. See [LICENSE](LICENSE).
