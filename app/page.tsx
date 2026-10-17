"use client";

import { useState } from "react";

const PRESETS = ["Where do I start?", "Explain the architecture", "Suggest a good first contribution"];
const MODEL = process.env.NEXT_PUBLIC_GEMMA_MODEL ?? "Gemma 4";

type Msg = { role: "user" | "assistant"; text: string; model?: string };

async function post(url: string, body: object) {
  const res = await fetch(url, { method: "POST", body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [repo, setRepo] = useState<string | null>(null);
  const [mapping, setMapping] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  async function mapRepo(e: React.FormEvent) {
    e.preventDefault();
    setMapping(true);
    setError("");
    try {
      setRepo((await post("/api/map", { url })).repo);
      setMessages([]);
    } catch (err) {
      setError((err as Error).message);
    }
    setMapping(false);
  }

  async function askQuestion(q: string) {
    if (!q.trim() || thinking) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setThinking(true);
    try {
      const { answer, model } = await post("/api/ask", { repo, question: q });
      setMessages((m) => [...m, { role: "assistant", text: answer, model }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: `Error: ${(err as Error).message}` }]);
    }
    setThinking(false);
  }

  return (
    <main>
      <header>
        <h1>🧭 RepoBuddy</h1>
        <p className="muted">Graphify maps the repo · {MODEL} explains it</p>
      </header>

      <form className="row" onSubmit={mapRepo}>
        <label htmlFor="url" className="sr-only">GitHub repo URL</label>
        <input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/pallets/click"
          required
        />
        <button className="primary" disabled={mapping}>
          {mapping ? "Cloning + running Graphify…" : "Map repo"}
        </button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      {repo && (
        <div className="grid">
          <section className="panel">
            <h2>Knowledge graph</h2>
            <iframe src={`/api/graph/${repo}`} title={`Knowledge graph of ${repo}`} />
          </section>

          <section className="panel chat">
            <h2>Ask {MODEL}</h2>
            <div className="presets">
              {PRESETS.map((p) => (
                <button key={p} onClick={() => askQuestion(p)} disabled={thinking}>{p}</button>
              ))}
            </div>
            <div className="messages" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  {m.model && <div className="model">{m.model}</div>}
                  {m.text}
                </div>
              ))}
              {thinking && <div className="msg assistant muted">Gemma 4 is thinking…</div>}
            </div>
            <form className="row" onSubmit={(e) => { e.preventDefault(); askQuestion(question); }}>
              <label htmlFor="q" className="sr-only">Ask about this repo</label>
              <input id="q" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about this repo" />
              <button className="primary" disabled={thinking}>Ask</button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
