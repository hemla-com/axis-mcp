import { getActiveClient } from "./connect.js";

export async function getStreamProfiles(): Promise<string> {
  const client = getActiveClient();
  const data = await client.jsonRequest("streamprofile.cgi", "list", {
    streamProfileName: [],
  });

  const profiles = data.streamProfile ?? [];
  if (profiles.length === 0) return "No stream profiles found";

  const lines: string[] = [`Max profiles: ${data.maxProfiles ?? "unknown"}`, ""];
  for (const p of profiles) {
    lines.push(`[${p.name}]`);
    if (p.description) lines.push(`  Description: ${p.description}`);
    if (p.parameters) lines.push(`  Parameters: ${p.parameters}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

export async function createStreamProfile(input: {
  name: string;
  description?: string;
  parameters: string;
}): Promise<string> {
  const client = getActiveClient();
  await client.jsonRequest("streamprofile.cgi", "create", {
    streamProfile: [{
      name: input.name,
      description: input.description ?? "",
      parameters: input.parameters,
    }],
  });
  return `Stream profile '${input.name}' created`;
}

export async function updateStreamProfile(input: {
  name: string;
  description?: string;
  parameters: string;
}): Promise<string> {
  const client = getActiveClient();
  await client.jsonRequest("streamprofile.cgi", "update", {
    streamProfile: [{
      name: input.name,
      description: input.description ?? "",
      parameters: input.parameters,
    }],
  });
  return `Stream profile '${input.name}' updated`;
}

export async function removeStreamProfile(input: { name: string }): Promise<string> {
  const client = getActiveClient();
  await client.jsonRequest("streamprofile.cgi", "remove", {
    streamProfileName: [{ name: input.name }],
  });
  return `Stream profile '${input.name}' removed`;
}
