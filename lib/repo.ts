import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { GoogleGenAI } from "@google/genai";

const run = promisify(execFile);

// Verify the exact Gemma 4 model ID in Google AI Studio and set GEMMA_MODEL.
export const MODEL = process.env.GEMMA_MODEL ?? "gemma-4-26b-a4b-it";
// Ollama Cloud fallback when the Gemini API fails. Names come from https://ollama.com/api/tags.
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "gemma4:31b";
const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "https://ollama.com";
const WORK = path.join(tmpdir(), "repobuddy");
const GITHUB_URL = /^https:\/\/github\.com\/[\w.-]+\/([\w.-]+?)(?:\.git)?\/?$/;
const REPO_NAME = /^[\w.-]+$/;

export function repoDir(name: string): string {
  if (!REPO_NAME.test(name) || name.startsWith(".")) throw new Error("Invalid repo name");
  return path.join(WORK, name);
}

async function graphify(cwd: string, ...args: string[]): Promise<string> {
  // Code-only graphs are parsed locally by tree-sitter; no LLM backend needed.
  const { stdout } = await run("graphify", args, {
    cwd,
    env: { ...process.env, GRAPHIFY_BACKEND: "none" },
    maxBuffer: 64 * 1024 * 1024,
  });
  return stdout;
}

export async function buildGraph(url: string): Promise<string> {
  const match = GITHUB_URL.exec(url.trim());
  if (!match) throw new Error("Enter a URL like https://github.com/owner/repo");
  const name = match[1];
  const dir = repoDir(name);
  if (!existsSync(dir)) {
    await mkdir(WORK, { recursive: true });
    await run("git", ["clone", "--depth", "1", url.trim(), dir]);
  }
  // extract only writes graph.json; cluster-only adds GRAPH_REPORT.md and graph.html.
  if (!existsSync(path.join(dir, "graphify-out", "GRAPH_REPORT.md"))) {
    await graphify(dir, "extract", ".", "--code-only");
    await graphify(dir, "cluster-only", ".");
  }
  return name;
}

async function gemini(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({ model: MODEL, contents: prompt });
  if (!res.text) throw new Error("Empty Gemini response");
  return res.text;
}

async function ollama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
    body: JSON.stringify({ model: OLLAMA_MODEL, messages: [{ role: "user", content: prompt }], stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama: ${await res.text()}`);
  return (await res.json()).message.content;
}

export async function ask(name: string, question: string): Promise<{ answer: string; model: string }> {
  const dir = repoDir(name);
  // graphify query returns a scoped subgraph; the report gives the big picture.
  const subgraph = await graphify(dir, "query", question);
  const report = await readFile(path.join(dir, "graphify-out", "GRAPH_REPORT.md"), "utf-8");
  const prompt = `You are RepoBuddy, helping a first-time open-source contributor.
Answer using ONLY the code knowledge graph below. Always name real file paths.
If the graph doesn't contain the answer, say so.

<graph_report>
${report.slice(0, 30000)}
</graph_report>

<relevant_subgraph>
${subgraph.slice(0, 30000)}
</relevant_subgraph>

Question: ${question}`;
  try {
    return { answer: await gemini(prompt), model: MODEL };
  } catch (e) {
    console.warn("Gemini failed, falling back to Ollama Cloud:", (e as Error).message);
    return { answer: await ollama(prompt), model: `${OLLAMA_MODEL} (Ollama Cloud)` };
  }
}
