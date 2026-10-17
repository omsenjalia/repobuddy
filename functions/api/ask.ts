import { callTool, error, gemma, json, NotConnected, type Env } from "../_lib/cloud";

const REPO = /^[\w.-]+\/[\w.-]+$/;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { repo, question } = await request.json<{ repo?: string; question?: string }>().catch(() => ({}) as never);
  if (!question?.trim()) return error("Ask a question", 400);
  if (!repo || !REPO.test(repo)) return error("Pick a repo", 400);
  if (question.length > 2000) return error("Keep questions under 2000 characters", 400);

  let context: string;
  try {
    // query_graph returns the retrieved slice of the graph, already formatted for a model.
    const res = await callTool(env, "query_graph", { question, repository_id: repo, budget: 8000 });
    context = typeof res === "string" ? res : res.result?.context ?? JSON.stringify(res);
  } catch (e) {
    return error((e as Error).message, e instanceof NotConnected ? 503 : 502);
  }

  const prompt = `You are RepoBuddy, helping a first-time open-source contributor to ${repo}.
Answer using ONLY the code knowledge graph context below. Always name real file paths.
If the context doesn't contain the answer, say so.

<graph_context>
${context.slice(0, 60000)}
</graph_context>

Question: ${question}`;
  try {
    return json(await gemma(env, prompt));
  } catch (e) {
    return error((e as Error).message, 502);
  }
};
