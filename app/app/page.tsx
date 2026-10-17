"use client";

import { useEffect, useRef, useState } from "react";
import { GITHUB_URL } from "../ui";

const PRESETS = ["Where do I start?", "Explain the architecture", "Suggest a good first contribution"];
const MODEL = process.env.NEXT_PUBLIC_GEMMA_MODEL ?? "Gemma 4";
const RECENT_KEY = "repobuddy:recent";
const STAGES = ["Cloning repository", "Parsing code with tree-sitter", "Clustering the graph"];

type Msg = { role: "user" | "assistant"; text: string; model?: string; error?: boolean };

// Beta ("cloud"): Pages Functions on the same origin answer from Graphify Cloud, limited to its indexed repos.
// Production ("server"): the FastAPI server in server/ clones and maps any public repo.
const CLOUD = process.env.NEXT_PUBLIC_BACKEND !== "server";
const API = CLOUD ? "/api" : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const EXAMPLES = ["pallets/click", "psf/requests", "expressjs/express"];

type Indexed = { fullName: string; nodeCount: number; webUrl: string };

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function post(path: string, body: object) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {
    throw new ApiError("Can't reach the RepoBuddy API. Try again in a minute.", 0);
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.detail ?? `Request failed (${res.status})`, res.status);
  return data;
}

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {}
}

// Gemma answers in light markdown: headings, bullets, `code` and **bold**. Line breaks are kept via CSS.
function Rich({ text }: { text: string }) {
  return (
    <>
      {text
        .replace(/^#{1,6}\s+(.+)$/gm, "**$1**")
        .replace(/^(\s*)[*-]\s+/gm, "$1• ")
        .split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g)
        .map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 1 ? <code key={i}>{part.slice(1, -1)}</code>
        : part.startsWith("**") && part.endsWith("**") && part.length > 3 ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
      )}
    </>
  );
}

export default function Workspace() {
  const [url, setUrl] = useState("");
  const [repo, setRepo] = useState<string | null>(null);
  const [mapping, setMapping] = useState(false);
  const [stage, setStage] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const mappedUrl = useRef("");
  const [indexed, setIndexed] = useState<Indexed[] | null>(null);

  useEffect(() => {
    setRecent(loadRecent());
    const fromQuery = new URLSearchParams(window.location.search).get("url");
    if (!CLOUD) {
      if (fromQuery) mapRepo(fromQuery);
      return;
    }
    fetch(`${API}/repos`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail ?? `Request failed (${res.status})`);
        setIndexed(data);
        if (fromQuery) mapRepo(fromQuery, data);
      })
      .catch((err) => {
        setIndexed([]);
        setError(err instanceof TypeError ? "Can't reach the RepoBuddy API. Try again in a minute." : err.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, thinking]);

  // shortcut: stages advance on a timer since the API doesn't stream progress; upgrade to SSE if users need real progress.
  useEffect(() => {
    if (!mapping) return;
    setStage(0);
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 6000);
    return () => clearInterval(t);
  }, [mapping]);

  function open(name: string, clean: string) {
    mappedUrl.current = clean;
    setRepo(name);
    setMessages([]);
    const next = [clean, ...loadRecent().filter((r) => r !== clean)].slice(0, 6);
    setRecent(next);
    saveRecent(next);
    window.history.replaceState(null, "", `/app?url=${encodeURIComponent(clean)}`);
  }

  async function mapRepo(target: string, list = indexed ?? []) {
    const clean = target.trim();
    setUrl(clean);
    if (!GITHUB_URL.test(clean)) return setError("Enter a URL like https://github.com/owner/repo");
    if (CLOUD) {
      const full = clean.replace(/^https:\/\/github\.com\//, "").replace(/(\.git)?\/?$/, "").toLowerCase();
      const hit = list.find((r) => r.fullName.toLowerCase() === full);
      if (!hit) return setError(`During the beta, RepoBuddy only knows ${list.map((r) => r.fullName).join(", ") || "a few repos"}. More are coming.`);
      setError("");
      return open(hit.fullName, clean);
    }
    setMapping(true);
    setError("");
    try {
      const { repo } = await post("/map", { url: clean });
      open(repo, clean);
    } catch (err) {
      setError((err as Error).message);
    }
    setMapping(false);
  }

  async function askQuestion(q: string) {
    if (!q.trim() || thinking || !repo) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setThinking(true);
    try {
      const ask = () => post("/ask", { repo, question: q });
      // The free API host wipes its disk when it sleeps; rebuild the graph once and retry.
      const { answer, model } = await ask().catch(async (err) => {
        if (CLOUD || !(err instanceof ApiError && err.status === 404 && mappedUrl.current)) throw err;
        await post("/map", { url: mappedUrl.current });
        return ask();
      });
      setMessages((m) => [...m, { role: "assistant", text: answer, model }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: (err as Error).message, error: true }]);
    }
    setThinking(false);
  }

  return (
    <div className="workspace">
      <div className="ws-bar">
        <form className="ws-form" onSubmit={(e) => { e.preventDefault(); mapRepo(url); }} noValidate>
          <label htmlFor="url" className="sr-only">GitHub repo URL</label>
          <input
            id="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            placeholder="https://github.com/pallets/click"
            aria-invalid={!!error}
            aria-describedby={error ? "url-error" : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="btn btn-ink" disabled={mapping}>{mapping ? "Mapping…" : CLOUD ? "Open repo" : "Map repo"}</button>
        </form>
        {!CLOUD && recent.length > 0 && (
          <div className="recent" aria-label="Recent repos">
            <span className="muted">Recent</span>
            {recent.map((r) => (
              <button key={r} type="button" className="chip" onClick={() => mapRepo(r)} disabled={mapping}>
                {r.replace("https://github.com/", "")}
              </button>
            ))}
          </div>
        )}
        {error && <p id="url-error" className="field-error" role="alert">{error}</p>}
      </div>

      {mapping ? (
        <div className="ws-state" role="status" aria-live="polite">
          <ol className="stages">
            {STAGES.map((s, i) => (
              <li key={s} data-state={i < stage ? "done" : i === stage ? "active" : "todo"}>{s}</li>
            ))}
          </ol>
          <p className="muted">Large repos can take a minute or two. Repos you mapped before open instantly.</p>
        </div>
      ) : !repo ? (
        <div className="ws-state">
          <h1>{CLOUD ? "Pick a repo to get started" : "Map a repo to get started"}</h1>
          <p className="muted">
            {CLOUD
              ? "RepoBuddy is in beta: it answers about the repos below, each already mapped into a knowledge graph. Any public repo is coming soon."
              : "Paste any public GitHub URL above. RepoBuddy clones it, builds a knowledge graph, and opens a chat grounded in that graph."}
          </p>
          <div className="recent">
            {CLOUD && indexed === null && <span className="muted small">Loading repos…</span>}
            {(CLOUD ? (indexed ?? []).map((r) => r.fullName) : EXAMPLES).map((r) => (
              <button key={r} type="button" className="chip" onClick={() => mapRepo(`https://github.com/${r}`)}>{r}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className={CLOUD ? "ws-grid ws-single" : "ws-grid"}>
          {!CLOUD && <section className="panel" aria-labelledby="graph-h">
            <div className="panel-head">
              <h2 id="graph-h">Knowledge graph</h2>
              <a className="link" href={`${API}/graph/${repo}`} target="_blank" rel="noreferrer">Open full screen ↗</a>
            </div>
            <iframe src={`${API}/graph/${repo}`} title={`Knowledge graph of ${repo}`} />
          </section>}

          <section className="panel chat" aria-labelledby="chat-h">
            <div className="panel-head">
              <h2 id="chat-h">Ask about <code>{repo}</code></h2>
              <span className="muted small">{MODEL}</span>
            </div>
            <div className="messages" aria-live="polite">
              {messages.length === 0 && !thinking && (
                <div className="presets">
                  <p className="muted small">Start with one of these</p>
                  {PRESETS.map((p) => (
                    <button key={p} type="button" className="preset" onClick={() => askQuestion(p)}>{p}</button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}${m.error ? " error" : ""}`}>
                  {m.model && <div className="model">{m.model}</div>}
                  {m.role === "assistant" && !m.error ? <Rich text={m.text} /> : m.text}
                </div>
              ))}
              {thinking && (
                <div className="msg assistant skeleton" aria-label={`${MODEL} is thinking`}>
                  <span /><span /><span />
                </div>
              )}
              <div ref={endRef} />
            </div>
            <form className="ask" onSubmit={(e) => { e.preventDefault(); askQuestion(question); }}>
              <label htmlFor="q" className="sr-only">Ask about this repo</label>
              <input id="q" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about this repo" autoComplete="off" />
              <button className="btn btn-ink" disabled={thinking || !question.trim()}>Ask</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
