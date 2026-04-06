import { getActiveClient } from "./connect.js";

export async function discoverApis(): Promise<string> {
  const client = getActiveClient();
  const data = await client.jsonRequest("apidiscovery.cgi", "getApiList", {
    id: "*",
    version: "*",
  });

  const apis = data.apiList ?? [];
  if (apis.length === 0) return "No APIs discovered";

  const lines: string[] = [`Found ${apis.length} APIs:`, ""];
  for (const api of apis) {
    lines.push(`${api.id} v${api.version} [${api.status}] - ${api.name}`);
  }
  return lines.join("\n");
}
