# RepoBuddy — Hackathon Plan

> Hacktoberfest Hack Day Vadodara × NavraCommunity · 17 Oct 2026 · **2 hours** · max 3 people

**One line:** Paste a GitHub repo → Graphify maps it into a knowledge graph → Gemma 4 answers "where do I start / where is X / what breaks if I change Y" using that graph.

**Why:** Hacktoberfest newcomers waste hours figuring out unfamiliar codebases before their first PR. RepoBuddy gets them to the right files in seconds.

---

## 1. Prize categories (tick all three)

| Category | How RepoBuddy qualifies | Must-have proof |
|---|---|---|
| **Best Use of Gemma 4** | Gemma 4 (via Gemini API) answers every question, grounded in the graph | Model name visible in UI + README |
| **Best Open-Source AI Project** (DigitalOcean) | Gemma 4 is open-weight and is the core of the app | Public GitHub repo + MIT `LICENSE` |
| **Best Use of Graphify** | Graphify maps the repo; we query the graph and render it | Graph visible on screen during demo |

Optional bonus (only if 10 min spare): add `SKILL.md` exposing RepoBuddy as an agent skill (must follow the Agent Skill Open Standard).

---

## 2. Scope

### MVP (must ship)
1. Text input: GitHub repo URL
2. Clone repo (shallow) → run Graphify on it
3. Show the graph (Graphify's HTML/visual output, or a simple node list fallback)
4. Chat box: question → Gemma 4 with graph summary as context → answer naming real files
5. 3 preset buttons: **"Where do I start?"**, **"Explain the architecture"**, **"Suggest a good first contribution"**

### Explicitly NOT doing
Login, database, deployment, multi-repo, GitHub issues API, streaming responses, styling polish. Demo runs on localhost.

---

## 3. Tech stack

| Part | Choice | Why |
|---|---|---|
| UI | **Streamlit** | One Python file, zero frontend work |
| LLM | **Gemma 4 via Gemini API** (`google-genai` SDK) | Required for Gemma track; no GPU needed |
| Code graph | **Graphify OSS** | Required for Graphify track |
| Clone | `git clone --depth 1` via `subprocess` | No extra dependency |

```bash
pip install streamlit google-genai
```
Plus Graphify — install per its README (verify the exact package/command in the first 15 min).

---

## 4. Team roles

| Person | Owns | Done when |
|---|---|---|
| **A — Graph** | Clone + Graphify run + load its output + render graph | Function `build_graph(url) -> (graph_text, graph_html_path)` works on test repo |
| **B — AI** | Gemma 4 prompt + `ask(question, graph_text)` | Returns answers that cite real file paths from the test repo |
| **C — Ship** | Streamlit UI shell, GitHub repo, README, LICENSE, demo video, submission | Repo public, README done, submission drafted in OrganizerHQ |

---

## 5. Timeline (120 min)

| Time | Everyone / A / B / C |
|---|---|
| **0:00–0:15** | **All:** read Graphify README, run it once on a tiny repo, note output files/format. Create Gemini API key, make one Gemma 4 call. Create public GitHub repo with MIT license. **Pick the demo repo** (small, well-known, <200 files). |
| **0:15–1:05** | **A:** `build_graph()` · **B:** `ask()` + prompt tuning on the demo repo · **C:** Streamlit layout with fake data, README draft |
| **1:05–1:25** | Merge into `app.py`. Run end-to-end on demo repo. Fix only blockers. |
| **1:25–1:35** | Test on a 2nd repo. Pre-run the demo repo so the graph is cached (no waiting on stage). |
| **1:35** | 🛑 **Feature freeze.** |
| **1:35–1:45** | Record 60–90s demo video / screenshots. Push final code. |
| **1:45–1:55** | Submit on **MLH OrganizerHQ**, tick all 3 categories. |
| **1:55–2:00** | Buffer. |

**Rule:** if anything is stuck for >10 min, take the fallback (Section 8) and move on.

---

## 6. Code skeleton (`app.py`)

```python
import pathlib, subprocess, tempfile
import streamlit as st
from google import genai

MODEL = "gemma-4-..."  # check exact Gemma 4 model ID in Google AI Studio
client = genai.Client()  # reads GEMINI_API_KEY env var
WORK = pathlib.Path(tempfile.gettempdir()) / "repobuddy"


def build_graph(url: str) -> tuple[str, pathlib.Path | None]:
    repo = WORK / url.rstrip("/").split("/")[-1]
    if not repo.exists():
        subprocess.run(["git", "clone", "--depth", "1", url, str(repo)], check=True)
    # TODO(A): replace with the real Graphify command from its README
    subprocess.run(["graphify", str(repo)], check=True, cwd=repo)
    # TODO(A): point these at Graphify's actual output files
    graph_text = (repo / "graphify-out" / "GRAPH_REPORT.md").read_text(encoding="utf-8")
    html = repo / "graphify-out" / "graph.html"
    return graph_text, html if html.exists() else None


def ask(question: str, graph_text: str) -> str:
    prompt = f"""You are RepoBuddy, helping a first-time open-source contributor.
Use ONLY the code knowledge graph below. Always name real file paths.
If the graph doesn't contain the answer, say so.

<graph>
{graph_text[:60000]}
</graph>

Question: {question}"""
    return client.models.generate_content(model=MODEL, contents=prompt).text


st.title("🧭 RepoBuddy")
st.caption("Graphify maps the repo · Gemma 4 explains it")

url = st.text_input("GitHub repo URL")
if st.button("Map repo") and url:
    with st.spinner("Cloning + running Graphify..."):
        st.session_state.graph, st.session_state.html = build_graph(url)

if "graph" in st.session_state:
    if st.session_state.html:
        st.components.v1.html(st.session_state.html.read_text(encoding="utf-8"), height=500, scrolling=True)

    presets = ["Where do I start?", "Explain the architecture", "Suggest a good first contribution"]
    cols = st.columns(len(presets))
    q = next((p for c, p in zip(cols, presets) if c.button(p)), None)
    q = st.chat_input("Ask about this repo") or q
    if q:
        st.chat_message("user").write(q)
        with st.spinner("Gemma 4 is thinking..."):
            st.chat_message("assistant").write(ask(q, st.session_state.graph))
```

Run:
```bash
streamlit run app.py
```

---

## 7. Prompt tips (Person B)
- Put the graph **before** the question.
- Force file paths: "Always name real file paths from the graph."
- Cap graph size (`[:60000]` chars) so the request doesn't fail on big repos.
- Test the 3 preset questions on the demo repo until all 3 give good answers — these are what judges will see.

---

## 8. Fallbacks (use if stuck >10 min)

| Problem | Fallback |
|---|---|
| Graphify output format unclear | Feed Gemma the raw Graphify text output / report — whatever file it produces |
| Graph HTML won't render in Streamlit | Show a screenshot of the graph + list of top nodes as bullets |
| Graphify slow on big repos | Only demo the small pre-mapped repo |
| Gemma 4 model ID not found | List models in AI Studio; use the Gemma 4 variant shown there |
| Clone fails (Wi-Fi) | Clone the demo repo **before** the hack starts building; app skips clone if folder exists |
| Rate limit | Pre-record answers in demo video; keep 1 live question only |

---

## 9. README checklist (Person C)
- [ ] Project name + one-line description
- [ ] **Built with:** Gemma 4 (Gemini API) · Graphify OSS · Streamlit
- [ ] Screenshot / GIF of graph + an answer
- [ ] How it works (3 bullets: clone → Graphify graph → Gemma 4 answers from graph)
- [ ] Setup: `pip install ...`, set `GEMINI_API_KEY`, `streamlit run app.py`
- [ ] License: MIT
- [ ] Team names

**Never commit your API key.** Add `.env` to `.gitignore`.

---

## 10. Demo script (60–90 seconds)
1. **Problem (10s):** "Your first Hacktoberfest PR — you open a repo with 300 files. Where do you even start?"
2. **Map (15s):** Paste URL → graph appears. "Graphify maps every file and relationship."
3. **Ask (30s):** Click "Where do I start?" → Gemma 4 points to exact files. Ask one custom question live.
4. **Close (10s):** "Gemma 4 is open-weight, Graphify is OSS, and RepoBuddy is MIT-licensed on GitHub."

---

## 11. Submission checklist
- [ ] Repo is **public**
- [ ] `LICENSE` file (MIT) present
- [ ] README mentions Gemma 4 **and** Graphify
- [ ] Demo video/screenshots attached
- [ ] Submitted on **MLH OrganizerHQ** before deadline
- [ ] All 3 prize categories ticked
- [ ] All team members added to the project

---

## 12. Things to verify in the first 15 minutes
- [x] Graphify install: `pip install graphifyy` (double y), then `graphify install --project` to register the skill for your coding agent. Headless build on code: `graphify extract` (offline, no API key).
- [x] Graphify outputs `graphify-out/graph.html`, `GRAPH_REPORT.md`, `graph.json`. Query with `graphify query "<q>"`, `graphify path A B`, `graphify explain X`.
- [ ] Exact Gemma 4 model ID in the Gemini API
- [ ] Submission deadline time on OrganizerHQ
