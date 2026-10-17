import { callTool, error, json, NotConnected, type Env } from "../_lib/cloud";

type Repo = { fullName: string; queryable: boolean; status: string; nodeCount: number; webUrl: string };

// The repos indexed in the admin's Graphify Cloud workspace; in beta these are the only ones RepoBuddy can answer about.
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const { repositories } = await callTool(env, "list_repositories", {});
    return json(
      (repositories as Repo[])
        .filter((r) => r.queryable)
        .map(({ fullName, nodeCount, webUrl }) => ({ fullName, nodeCount, webUrl }))
    );
  } catch (e) {
    return error((e as Error).message, e instanceof NotConnected ? 503 : 502);
  }
};
