import { buildGraph } from "@/lib/repo";

export async function POST(req: Request) {
  const { url } = await req.json();
  try {
    return Response.json({ repo: await buildGraph(String(url ?? "")) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
