import { getActiveClient } from "./connect.js";

export async function getCaptureMode(): Promise<string> {
  const client = getActiveClient();
  const data = await client.jsonRequest("capturemode.cgi", "getCaptureModes");

  if (!Array.isArray(data)) return JSON.stringify(data, null, 2);

  const lines: string[] = [];
  for (const ch of data) {
    lines.push(`Channel ${ch.channel}:`);
    for (const mode of ch.captureMode ?? []) {
      const active = mode.enabled ? " [ACTIVE]" : "";
      const fps = mode.maxFPS ? ` @ ${mode.maxFPS} fps` : "";
      lines.push(`  Mode ${mode.captureModeId}: ${mode.description}${fps}${active}`);
    }
  }
  return lines.join("\n") || "No capture modes found";
}
