"""RepoBuddy API: clones a GitHub repo, maps it with Graphify, and answers questions with Gemma 4."""

import asyncio
import os
import re
import shutil
import tempfile
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from google import genai
from pydantic import BaseModel

# Verify the exact Gemma 4 model ID in Google AI Studio and set GEMMA_MODEL.
MODEL = os.environ.get("GEMMA_MODEL", "gemma-4-26b-a4b-it")
# Ollama Cloud fallback when the Gemini API fails. Names come from https://ollama.com/api/tags.
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma4:31b")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "https://ollama.com")
# "ollama" (default): Ollama Cloud only. "gemini": Gemini API first, Ollama Cloud as fallback.
PROVIDER = os.environ.get("LLM_PROVIDER", "ollama").strip().lower()
# WORK_DIR is a persistent disk in production so clones survive restarts.
# shortcut: nothing evicts old clones; add LRU cleanup when the disk nears full.
WORK = Path(os.environ.get("WORK_DIR") or tempfile.gettempdir()) / "repobuddy"
GITHUB_URL = re.compile(r"^https://github\.com/[\w.-]+/([\w.-]+?)(?:\.git)?/?$")
REPO_NAME = re.compile(r"^[\w.-]+$")

app = FastAPI(title="RepoBuddy API")
app.add_middleware(
    CORSMiddleware,
    # shortcut: any site may call the API (no cookies or auth, but it spends the model quota); pin origins before wider launch.
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def repo_dir(name: str) -> Path:
    if not REPO_NAME.match(name) or name.startswith("."):
        raise HTTPException(400, "Invalid repo name")
    return WORK / name


async def run(*args: str, cwd: Path | None = None) -> str:
    # Code-only graphs are parsed locally by tree-sitter; no LLM backend needed.
    proc = await asyncio.create_subprocess_exec(
        *args,
        cwd=cwd,
        env={**os.environ, "GRAPHIFY_BACKEND": "none"},
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    out, err = await proc.communicate()
    if proc.returncode:
        raise CommandError(proc.returncode, f"{' '.join(args)} failed: {(err or out).decode(errors='replace').strip()}")
    return out.decode(errors="replace")


class CommandError(Exception):
    def __init__(self, code: int, message: str):
        super().__init__(message)
        self.code = code


async def build(url: str, name: str) -> str:
    target = repo_dir(name)
    if not target.exists():
        WORK.mkdir(parents=True, exist_ok=True)
        try:
            await run("git", "clone", "--depth", "1", url, str(target))
        except CommandError:
            shutil.rmtree(target, ignore_errors=True)  # don't leave a half clone that blocks retries
            raise
    # extract only writes graph.json; cluster-only adds GRAPH_REPORT.md and graph.html.
    if not (target / "graphify-out" / "GRAPH_REPORT.md").exists():
        await run("graphify", "extract", ".", "--code-only", cwd=target)
        await run("graphify", "cluster-only", ".", cwd=target)
    return name


# Concurrent requests for the same repo share one build instead of racing git clone.
building: dict[str, asyncio.Task] = {}


class MapBody(BaseModel):
    url: str = ""


class AskBody(BaseModel):
    repo: str = ""
    question: str = ""


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/map")
async def map_repo(body: MapBody):
    url = body.url.strip()
    match = GITHUB_URL.match(url)
    if not match:
        raise HTTPException(400, "Enter a URL like https://github.com/owner/repo")
    name = match.group(1)
    task = building.get(name)
    if not task:
        task = building[name] = asyncio.create_task(build(url, name))
        task.add_done_callback(lambda _: building.pop(name, None))
    try:
        return {"repo": await asyncio.shield(task)}
    except CommandError as e:
        raise HTTPException(400, str(e))


@app.get("/graph/{repo}")
def graph(repo: str):
    path = repo_dir(repo) / "graphify-out" / "graph.html"
    if not path.exists():
        raise HTTPException(404, "Graph not found")
    return FileResponse(path, media_type="text/html")


async def gemini(prompt: str) -> str:
    if not os.environ.get("GEMINI_API_KEY"):
        raise RuntimeError("GEMINI_API_KEY is not set")
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    res = await client.aio.models.generate_content(model=MODEL, contents=prompt)
    if not res.text:
        raise RuntimeError("Empty Gemini response")
    return res.text


async def ollama(prompt: str) -> str:
    if not os.environ.get("OLLAMA_API_KEY"):
        raise RuntimeError("OLLAMA_API_KEY is not set")
    async with httpx.AsyncClient(timeout=180) as client:
        res = await client.post(
            f"{OLLAMA_HOST}/api/chat",
            headers={"Authorization": f"Bearer {os.environ['OLLAMA_API_KEY']}"},
            json={"model": OLLAMA_MODEL, "messages": [{"role": "user", "content": prompt}], "stream": False},
        )
    if res.is_error:
        raise RuntimeError(f"Ollama: {res.text}")
    return res.json()["message"]["content"]


@app.post("/ask")
async def ask(body: AskBody):
    if not body.question.strip():
        raise HTTPException(400, "Ask a question")
    target = repo_dir(body.repo)
    report_path = target / "graphify-out" / "GRAPH_REPORT.md"
    if not report_path.exists():
        # The host's disk is wiped on restart; the client re-maps and retries.
        raise HTTPException(404, "Repo not mapped. Map it again.")
    # graphify query returns a scoped subgraph; the report gives the big picture.
    try:
        subgraph = await run("graphify", "query", body.question, cwd=target)
    except CommandError as e:
        if e.code != 4:  # 4 means no node matched (broad questions); answer from the report alone.
            raise HTTPException(500, str(e))
        subgraph = "No nodes matched this question."
    report = report_path.read_text(encoding="utf-8")
    prompt = f"""You are RepoBuddy, helping a first-time open-source contributor.
Answer using ONLY the code knowledge graph below. Always name real file paths.
If the graph doesn't contain the answer, say so.

<graph_report>
{report[:30000]}
</graph_report>

<relevant_subgraph>
{subgraph[:30000]}
</relevant_subgraph>

Question: {body.question}"""
    if PROVIDER != "gemini":
        try:
            return {"answer": await ollama(prompt), "model": f"{OLLAMA_MODEL} (Ollama Cloud)"}
        except Exception as e:
            raise HTTPException(502, f"Ollama: {e}")
    try:
        return {"answer": await gemini(prompt), "model": MODEL}
    except Exception as e:
        print("Gemini failed, falling back to Ollama Cloud:", e)
        try:
            return {"answer": await ollama(prompt), "model": f"{OLLAMA_MODEL} (Ollama Cloud)"}
        except Exception as e2:
            raise HTTPException(502, f"Both models failed. Gemini: {e}. Ollama: {e2}")
