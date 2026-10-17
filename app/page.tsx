import Link from "next/link";
import { GITHUB } from "@/lib/site";
import { CopyButton, PipelineTabs, RepoForm } from "./ui";

const EXAMPLES = ["pallets/click", "psf/requests", "expressjs/express"];

const USES = [
  {
    q: "Where do I start?",
    a: "Get the three or four files that hold the project together, ranked by how much else depends on them, so you read the right code first.",
    tag: "Orientation",
  },
  {
    q: "Explain the architecture",
    a: "See the communities Graphify found, what each one owns, and how they talk to each other, before you open a single file.",
    tag: "Architecture",
  },
  {
    q: "Suggest a good first contribution",
    a: "Find small, self-contained corners of the graph with few dependents, where a first pull request is safe to land.",
    tag: "Contributing",
  },
  {
    q: "What calls parse_args?",
    a: "Trace any function through the call graph. Answers cite real paths like src/click/core.py, never invented ones.",
    tag: "Tracing",
  },
];

const SETUP = [
  { title: "Install Graphify", body: "Python 3.10+ in a virtualenv.", cmd: "pip install graphifyy" },
  { title: "Install the app", body: "Node 20+ and Git on your PATH.", cmd: `git clone ${GITHUB} && cd repobuddy && npm install` },
  { title: "Add a key and run", body: "A Gemini API key. Ollama Cloud is the optional fallback.", cmd: "GEMINI_API_KEY=your-key npm run dev" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="hero-badge">
            <span>Graphify</span>
            <span aria-hidden="true">×</span>
            <span>Gemma 4</span>
          </p>
          <h1>Find your first contribution in any GitHub repo.</h1>
          <p className="lede">
            Paste a repo. RepoBuddy maps it into a code knowledge graph, then answers your questions with real file paths.
          </p>
          <RepoForm />
          <p className="examples">
            Try{" "}
            {EXAMPLES.map((r) => (
              <Link key={r} href={`/app?url=${encodeURIComponent(`https://github.com/${r}`)}`}>{r}</Link>
            ))}
          </p>

          <div className="term hero-term" aria-label="Example session">
            <div className="term-bar">
              <span className="dots" aria-hidden="true"><i /><i /><i /></span>
              <span>Example session · pallets/click</span>
            </div>
            <div className="session">
              <p className="who">You</p>
              <p>Where do I start?</p>
              <p className="call">&gt;_ graphify query &quot;Where do I start?&quot;</p>
              <p className="who">RepoBuddy <span className="dim">via Gemma 4</span></p>
              <p>
                Start with <code>src/click/core.py</code>. <code>Command</code> and <code>Context</code> are the
                two most connected nodes; every decorator in <code>src/click/decorators.py</code> builds one. Then read{" "}
                <code>tests/test_basic.py</code> to see them used end to end.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section section-alt">
        <div className="container">
          <SectionHead n="01" kicker="What it does" title="Ask the questions every new contributor has">
            Four starter prompts sit next to the graph. Or ask your own, in plain language.
          </SectionHead>
          <ol className="uses">
            {USES.map((u) => (
              <li key={u.q} className="use">
                <span className="tag">{u.tag}</span>
                <h3>&ldquo;{u.q}&rdquo;</h3>
                <p>{u.a}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="how" className="section section-dark">
        <div className="container">
          <SectionHead n="02" kicker="Under the hood" title="Four commands behind every answer" dark>
            What RepoBuddy runs on the server when you map a repo and ask a question.
          </SectionHead>
          <PipelineTabs />
        </div>
      </section>

      <section id="self-host" className="section">
        <div className="container">
          <SectionHead n="03" kicker="Self-host" title="Run it on your machine in a few minutes">
            RepoBuddy is MIT licensed. Graphs are built locally; only your question and the relevant subgraph go to the model.
          </SectionHead>
          <ol className="steps">
            {SETUP.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step-n">{i + 1}</span>
                <div className="step-body">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <div className="cmd">
                    <code><span className="dim">$ </span>{s.cmd}</code>
                    <CopyButton text={s.cmd} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="cta">
            <div>
              <h3>Or skip setup and try it here.</h3>
              <p>Map a public repo in about a minute.</p>
            </div>
            <Link href="/app" className="btn btn-ink btn-lg">Open the app</Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <p className="brand">RepoBuddy</p>
            <p className="muted">Built at Hacktoberfest Hack Day Vadodara, October 2026.</p>
          </div>
          <nav aria-label="Footer" className="footer-links">
            <Link href="/app">App</Link>
            <Link href="/#how">How it works</Link>
            <a href={GITHUB}>Source</a>
            <a href={`${GITHUB}/blob/main/LICENSE`}>MIT license</a>
            <a href="https://github.com/Graphify-Labs/graphify">Graphify</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

function SectionHead({ n, kicker, title, dark, children }: { n: string; kicker: string; title: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <header className={`section-head${dark ? " dark" : ""}`}>
      <p className="kicker"><span>{n}</span>{kicker}</p>
      <h2>{title}</h2>
      <p className="lede">{children}</p>
    </header>
  );
}
