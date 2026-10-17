import { MCP_URL, randomString, registerClient, secretMatches, sha256, type Env } from "../../_lib/cloud";

// One-time admin step: sign RepoBuddy in to Graphify Cloud. Tokens land in KV and refresh themselves.
const page = (message = "") => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Connect Graphify · RepoBuddy</title>
<style>body{font:15px/1.5 system-ui,sans-serif;background:#fdfcfa;color:#1a1a1f;display:grid;place-items:center;min-height:100dvh;margin:0;padding:16px}
form{display:grid;gap:12px;width:min(360px,100%)}input,button{font:inherit;padding:10px 12px;border-radius:8px;border:1px solid #e9e6e0}
button{background:#1a1a1f;color:#fff;border-color:#1a1a1f;cursor:pointer}p.err{color:#b91c1c;margin:0}</style>
<form method="post"><h1 style="margin:0;font-size:22px">Connect Graphify</h1>
<p style="margin:0;color:#5f636b">Signs RepoBuddy in to your Graphify Cloud workspace.</p>
${message ? `<p class="err" role="alert">${message}</p>` : ""}
<label for="s">Admin password</label><input id="s" name="secret" type="password" required autocomplete="current-password">
<button>Continue to Graphify</button></form>`,
  { status: message ? 401 : 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
);

export const onRequestGet: PagesFunction<Env> = async () => page();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const form = await request.formData();
  if (!(await secretMatches(String(form.get("secret") ?? "").trim(), env.ADMIN_SECRET))) return page("Wrong password.");

  const redirectUri = new URL("/api/admin/callback", request.url).toString();
  const clientId = await registerClient(env, redirectUri);
  const state = randomString();
  const verifier = randomString(48);
  await env.GRAPHIFY_KV.put(`oauth:${state}`, verifier, { expirationTtl: 600 });

  const url = new URL("https://api.graphify.com/oauth/authorize");
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "graphify:query offline_access",
    state,
    code_challenge: await sha256(verifier),
    code_challenge_method: "S256",
    resource: MCP_URL,
  }).toString();
  return Response.redirect(url.toString(), 303);
};
