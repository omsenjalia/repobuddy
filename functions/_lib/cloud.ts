// Beta backend: Graphify Cloud (hosted MCP) for the graph, Gemma 4 for the answer.
// The production backend is server/ (FastAPI + local graphify CLI); see README.

export interface Env {
  GRAPHIFY_KV: KVNamespace;
  ADMIN_SECRET: string;
  GEMINI_API_KEY: string;
  OLLAMA_API_KEY?: string;
  GEMMA_MODEL?: string;
  OLLAMA_MODEL?: string;
}

const GRAPHIFY = "https://api.graphify.com";
export const MCP_URL = `${GRAPHIFY}/mcp`;

type Tokens = { access_token: string; refresh_token?: string; expires_at: number };

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function error(message: string, status: number) {
  return json({ detail: message }, status);
}

// ---------- OAuth (dynamic client registration + PKCE, public client) ----------

export async function registerClient(env: Env, redirectUri: string): Promise<string> {
  const saved = await env.GRAPHIFY_KV.get<{ client_id: string; redirect_uri: string }>("client", "json");
  if (saved?.redirect_uri === redirectUri) return saved.client_id;
  const res = await fetch(`${GRAPHIFY}/oauth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "RepoBuddy",
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }),
  });
  if (!res.ok) throw new Error(`Graphify client registration failed: ${await res.text()}`);
  const { client_id } = await res.json<{ client_id: string }>();
  await env.GRAPHIFY_KV.put("client", JSON.stringify({ client_id, redirect_uri: redirectUri }));
  return client_id;
}

export function randomString(bytes = 32) {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256(text: string) {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))));
}

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Hashing first makes the comparison length-independent; good enough for a single admin password.
export async function secretMatches(given: string, expected: string) {
  return !!expected && (await sha256(given)) === (await sha256(expected));
}

export async function exchangeToken(env: Env, params: Record<string, string>): Promise<Tokens> {
  const res = await fetch(`${GRAPHIFY}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...params, resource: MCP_URL }),
  });
  if (!res.ok) throw new Error(`Graphify token request failed: ${await res.text()}`);
  const t = await res.json<{ access_token: string; refresh_token?: string; expires_in?: number }>();
  const tokens = { access_token: t.access_token, refresh_token: t.refresh_token, expires_at: Date.now() + (t.expires_in ?? 3600) * 1000 };
  await env.GRAPHIFY_KV.put("tokens", JSON.stringify(tokens));
  return tokens;
}

// shortcut: two requests refreshing at the same moment can race on a rotated refresh token; move to a Durable Object if that bites.
async function accessToken(env: Env): Promise<string> {
  const tokens = await env.GRAPHIFY_KV.get<Tokens>("tokens", "json");
  if (!tokens) throw new NotConnected();
  if (tokens.expires_at - 60_000 > Date.now()) return tokens.access_token;
  const client = await env.GRAPHIFY_KV.get<{ client_id: string }>("client", "json");
  if (!tokens.refresh_token || !client) throw new NotConnected();
  try {
    return (await exchangeToken(env, { grant_type: "refresh_token", refresh_token: tokens.refresh_token, client_id: client.client_id })).access_token;
  } catch {
    throw new NotConnected();
  }
}

export class NotConnected extends Error {
  constructor() {
    super("RepoBuddy isn't connected to Graphify right now. The admin needs to reconnect it.");
  }
}

// ---------- MCP over Streamable HTTP ----------

async function rpc(headers: Record<string, string>, body: object): Promise<{ result?: any; error?: any; session?: string }> {
  const res = await fetch(MCP_URL, { method: "POST", headers, body: JSON.stringify(body) });
  if (res.status === 401) throw new NotConnected();
  if (!res.ok) throw new Error(`Graphify MCP ${res.status}: ${await res.text()}`);
  const session = res.headers.get("mcp-session-id") ?? undefined;
  if (!("id" in body)) return { session }; // notification: no reply body
  const text = await res.text();
  // Servers may answer with plain JSON or a one-shot SSE stream of "data:" lines.
  const messages = (res.headers.get("content-type") ?? "").includes("text/event-stream")
    ? text.split("\n").filter((l) => l.startsWith("data:")).map((l) => JSON.parse(l.slice(5)))
    : [JSON.parse(text)];
  const reply = messages.find((m) => m.id === (body as { id: number }).id);
  return { ...reply, session };
}

export async function callTool(env: Env, name: string, args: object): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${await accessToken(env)}`,
  };
  const init = await rpc(headers, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "repobuddy", version: "1.0" } },
  });
  if (init.error) throw new Error(`Graphify MCP initialize: ${init.error.message}`);
  if (init.session) headers["Mcp-Session-Id"] = init.session;
  headers["MCP-Protocol-Version"] = init.result?.protocolVersion ?? "2025-06-18";
  await rpc(headers, { jsonrpc: "2.0", method: "notifications/initialized" });
  const call = await rpc(headers, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name, arguments: args } });
  if (call.error) throw new Error(`Graphify ${name}: ${call.error.message}`);
  const text = (call.result?.content ?? []).map((c: { text?: string }) => c.text ?? "").join("");
  if (call.result?.isError) throw new Error(`Graphify ${name}: ${text}`);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---------- Gemma 4 ----------

async function gemini(env: Env, prompt: string, model: string): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json<any>();
  // Gemma's reasoning comes back as parts flagged `thought`; only the rest is the answer.
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .filter((p: { thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

async function ollama(env: Env, prompt: string, model: string): Promise<string> {
  const res = await fetch("https://ollama.com/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.OLLAMA_API_KEY ?? ""}` },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama: ${await res.text()}`);
  return (await res.json<any>()).message.content;
}

export async function gemma(env: Env, prompt: string): Promise<{ answer: string; model: string }> {
  const model = env.GEMMA_MODEL ?? "gemma-4-26b-a4b-it";
  try {
    return { answer: await gemini(env, prompt, model), model };
  } catch (e) {
    console.warn("Gemini failed, falling back to Ollama Cloud:", (e as Error).message);
    const fallback = env.OLLAMA_MODEL ?? "gemma4:31b";
    return { answer: await ollama(env, prompt, fallback), model: `${fallback} (Ollama Cloud)` };
  }
}
