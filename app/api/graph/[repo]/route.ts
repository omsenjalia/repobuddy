import { readFile } from "node:fs/promises";
import path from "node:path";
import { repoDir } from "@/lib/repo";

export async function GET(_req: Request, { params }: { params: Promise<{ repo: string }> }) {
  try {
    const html = await readFile(path.join(repoDir((await params).repo), "graphify-out", "graph.html"));
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch {
    return new Response("Graph not found", { status: 404 });
  }
}
