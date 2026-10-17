import { ask } from "@/lib/repo";

export async function POST(req: Request) {
  const { repo, question } = await req.json();
  if (!question) return Response.json({ error: "Ask a question" }, { status: 400 });
  try {
    return Response.json(await ask(String(repo), String(question)));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
