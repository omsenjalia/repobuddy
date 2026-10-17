import os
import pathlib
import subprocess
import tempfile

import streamlit as st
from google import genai

# Verify the exact Gemma 4 model ID in Google AI Studio and set GEMMA_MODEL.
MODEL = os.environ.get("GEMMA_MODEL", "gemma-4-26b-a4b-it")
WORK = pathlib.Path(tempfile.gettempdir()) / "repobuddy"
# Code-only graphs are parsed locally by tree-sitter; no LLM backend needed.
GRAPHIFY_ENV = {**os.environ, "GRAPHIFY_BACKEND": "none"}

client = genai.Client()  # reads GEMINI_API_KEY


def graphify(repo: pathlib.Path, *args: str) -> str:
    out = subprocess.run(["graphify", *args], cwd=repo, env=GRAPHIFY_ENV,
                         capture_output=True, text=True, check=True)
    return out.stdout


def build_graph(url: str) -> pathlib.Path:
    repo = WORK / url.rstrip("/").removesuffix(".git").split("/")[-1]
    if not repo.exists():
        WORK.mkdir(parents=True, exist_ok=True)
        subprocess.run(["git", "clone", "--depth", "1", url, str(repo)], check=True)
    if not (repo / "graphify-out" / "graph.json").exists():
        graphify(repo, "extract")
    return repo


def ask(repo: pathlib.Path, question: str) -> str:
    # graphify query returns a scoped subgraph; the report gives the big picture.
    subgraph = graphify(repo, "query", question)
    report = (repo / "graphify-out" / "GRAPH_REPORT.md").read_text(encoding="utf-8")
    prompt = f"""You are RepoBuddy, helping a first-time open-source contributor.
Answer using ONLY the code knowledge graph below. Always name real file paths.
If the graph doesn't contain the answer, say so.

<graph_report>
{report[:30000]}
</graph_report>

<relevant_subgraph>
{subgraph[:30000]}
</relevant_subgraph>

Question: {question}"""
    return client.models.generate_content(model=MODEL, contents=prompt).text


st.set_page_config(page_title="RepoBuddy", page_icon="🧭", layout="wide")
st.title("🧭 RepoBuddy")
st.caption(f"Graphify maps the repo · {MODEL} explains it")

url = st.text_input("GitHub repo URL", placeholder="https://github.com/pallets/click")
if st.button("Map repo", type="primary") and url:
    with st.spinner("Cloning + running Graphify..."):
        st.session_state.repo = build_graph(url)

if "repo" in st.session_state:
    repo = st.session_state.repo
    graph_col, chat_col = st.columns([3, 2], gap="large")

    with graph_col:
        st.subheader("Knowledge graph")
        html = repo / "graphify-out" / "graph.html"
        if html.exists():
            st.components.v1.html(html.read_text(encoding="utf-8"), height=600, scrolling=True)

    with chat_col:
        st.subheader("Ask Gemma 4")
        presets = ["Where do I start?", "Explain the architecture", "Suggest a good first contribution"]
        clicked = [p for p in presets if st.button(p, use_container_width=True)]  # list, so every button renders
        q = clicked[0] if clicked else None
        q = st.chat_input("Ask about this repo") or q
        if q:
            st.chat_message("user").write(q)
            with st.spinner("Gemma 4 is thinking..."):
                st.chat_message("assistant").write(ask(repo, q))
