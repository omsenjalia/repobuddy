"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export const GITHUB_URL = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+?(?:\.git)?\/?$/;

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-copy"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

// Landing-page form: validates, then hands the URL to the workspace, which maps it.
export function RepoForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="repo-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!GITHUB_URL.test(url.trim())) return setError("Enter a URL like https://github.com/owner/repo");
        router.push(`/app?url=${encodeURIComponent(url.trim())}`);
      }}
    >
      <label htmlFor="hero-url" className="sr-only">GitHub repo URL</label>
      <span className="repo-form-prefix" aria-hidden="true">$</span>
      <input
        id="hero-url"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setError(""); }}
        placeholder="https://github.com/pallets/click"
        aria-invalid={!!error}
        aria-describedby={error ? "hero-url-error" : undefined}
        autoComplete="off"
        spellCheck={false}
      />
      <button className="btn btn-ink">Map repo</button>
      {error && <p id="hero-url-error" className="field-error" role="alert">{error}</p>}
    </form>
  );
}

const STEPS = [
  {
    name: "clone",
    title: "Shallow clone",
    cmd: "git clone --depth 1 https://github.com/pallets/click",
    body: "Only the latest commit is fetched, so even large repos land in seconds. Clones are cached, so mapping the same repo twice is instant.",
    out: "Cloning into 'click'...\nReceiving objects: 100% (214/214), done.",
  },
  {
    name: "extract",
    title: "Graphify extract",
    cmd: "graphify extract . --code-only",
    body: "Tree-sitter parses every source file locally into nodes (files, classes, functions) and edges (calls, imports, inherits). No API key, no cost.",
    out: "parsed 62 files\nwrote graphify-out/graph.json",
  },
  {
    name: "cluster",
    title: "Cluster",
    cmd: "graphify cluster-only .",
    body: "Community detection groups related code, ranks the god nodes everything depends on, and writes a report plus an interactive graph.",
    out: "wrote graphify-out/GRAPH_REPORT.md\nwrote graphify-out/graph.html",
  },
  {
    name: "ask",
    title: "Query + Gemma 4",
    cmd: 'graphify query "Where do I start?"',
    body: "Each question pulls a scoped subgraph. Gemma 4 answers from that subgraph and the report only, and names real file paths. Ollama Cloud steps in if the Gemini API fails.",
    out: "→ src/click/core.py · Command, Context\n→ src/click/decorators.py · command()",
  },
];

export function PipelineTabs() {
  const [i, setI] = useState(0);
  const s = STEPS[i];
  return (
    <div className="pipeline">
      <div className="pipeline-tabs" role="tablist" aria-label="Pipeline step">
        <p className="eyebrow-dark">Pick a step</p>
        {STEPS.map((step, n) => (
          <button
            key={step.name}
            role="tab"
            id={`tab-${step.name}`}
            aria-selected={n === i}
            aria-controls="pipeline-panel"
            className="pipeline-tab"
            onClick={() => setI(n)}
          >
            <code>{step.name}</code>
            <span>{step.title}</span>
          </button>
        ))}
      </div>
      <div className="pipeline-panel" role="tabpanel" id="pipeline-panel" aria-labelledby={`tab-${s.name}`}>
        <p>{s.body}</p>
        <div className="term term-inset">
          <div className="term-bar"><span>request</span><CopyButton text={s.cmd} /></div>
          <pre><span className="dim">$ </span>{s.cmd}</pre>
        </div>
        <div className="term term-inset">
          <div className="term-bar"><span>response</span></div>
          <pre className="ok">{s.out}</pre>
        </div>
      </div>
    </div>
  );
}
