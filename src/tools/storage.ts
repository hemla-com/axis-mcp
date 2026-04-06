import { getActiveClient } from "./connect.js";

export async function getStorageInfo(): Promise<string> {
  const client = getActiveClient();
  try {
    const data = await client.jsonRequest("disks/list.cgi", "getAllProperties");
    return JSON.stringify(data, null, 2);
  } catch {
    const params = await client.getParams("Storage");
    const lines: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      lines.push(`${key}: ${value}`);
    }
    return lines.join("\n") || "No storage info found (camera may not have SD card)";
  }
}
