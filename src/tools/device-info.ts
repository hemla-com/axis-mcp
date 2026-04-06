import { getActiveClient } from "./connect.js";

export async function getDeviceInfo(): Promise<string> {
  const client = getActiveClient();
  const data = await client.jsonRequest("basicdeviceinfo.cgi", "getAllProperties");
  const props = data.propertyList;

  const lines: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    lines.push(`${key}: ${value}`);
  }
  return lines.join("\n");
}
