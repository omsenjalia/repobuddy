import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import Link from "next/link";
import { GITHUB } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fira = Fira_Code({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "RepoBuddy · Find your first contribution in any repo", template: "%s · RepoBuddy" },
  description: "Paste a GitHub repo. Graphify maps it into a knowledge graph, Gemma 4 tells you where to start contributing.",
  openGraph: {
    title: "RepoBuddy",
    description: "Graphify maps the repo, Gemma 4 tells you where to start contributing.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fira.variable}`}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <header className="site-header">
          <nav className="container nav" aria-label="Main">
            <Link href="/" className="brand">
              <img src="/icon.svg" width="24" height="24" alt="" />
              RepoBuddy
            </Link>
            <div className="nav-links">
              <Link href="/#features">What it does</Link>
              <Link href="/#how">How it works</Link>
              <Link href="/#self-host">Self-host</Link>
              <a href={GITHUB}>GitHub</a>
            </div>
            <Link href="/app" className="btn btn-ink">Open app</Link>
          </nav>
        </header>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
