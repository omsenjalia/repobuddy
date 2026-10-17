import Link from "next/link";

export default function NotFound() {
  return (
    <section className="ws-state">
      <p className="kicker"><span>404</span>Not found</p>
      <h1>This page isn&rsquo;t on the graph.</h1>
      <p className="muted">The link may be old or mistyped.</p>
      <div className="recent">
        <Link href="/" className="btn">Home</Link>
        <Link href="/app" className="btn btn-ink">Open the app</Link>
      </div>
    </section>
  );
}
