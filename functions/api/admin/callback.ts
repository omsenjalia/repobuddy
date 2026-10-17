import { exchangeToken, type Env } from "../../_lib/cloud";

const done = (message: string, status = 200) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><title>Graphify · RepoBuddy</title>
<body style="font:15px/1.5 system-ui,sans-serif;background:#fdfcfa;color:#1a1a1f;display:grid;place-items:center;min-height:100dvh;margin:0;padding:16px">
<p>${message} <a href="/app">Open the app</a></p></body>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const params = new URL(request.url).searchParams;
  const state = params.get("state") ?? "";
  const verifier = state && (await env.GRAPHIFY_KV.get(`oauth:${state}`));
  if (!verifier) return done("This sign-in link expired. Start again from /api/admin/connect.", 400);
  await env.GRAPHIFY_KV.delete(`oauth:${state}`);
  if (params.get("iss") && params.get("iss") !== "https://api.graphify.com") return done("Unexpected issuer.", 400);
  if (params.get("error")) return done(`Graphify said: ${params.get("error_description") ?? params.get("error")}.`, 400);

  const client = await env.GRAPHIFY_KV.get<{ client_id: string; redirect_uri: string }>("client", "json");
  if (!client) return done("Client registration is missing. Start again from /api/admin/connect.", 400);
  try {
    await exchangeToken(env, {
      grant_type: "authorization_code",
      code: params.get("code") ?? "",
      redirect_uri: client.redirect_uri,
      client_id: client.client_id,
      code_verifier: verifier,
    });
  } catch (e) {
    return done((e as Error).message.replace(/</g, "&lt;"), 502);
  }
  return done("Graphify is connected.");
};
