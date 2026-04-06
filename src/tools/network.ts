import { getActiveClient } from "./connect.js";

export async function getNetworkInfo(): Promise<string> {
  const client = getActiveClient();
  const params = await client.getParams("Network");

  const lines: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    lines.push(`${key}: ${value}`);
  }
  return lines.join("\n") || "No network info found";
}

export async function getNetworkConfig(): Promise<string> {
  const client = getActiveClient();
  try {
    const data = await client.jsonRequest("network_settings.cgi", "getNetworkInfo");
    return JSON.stringify(data, null, 2);
  } catch {
    return getNetworkInfo();
  }
}

export async function setNetworkConfig(input: {
  hostname?: string;
  ipv4Enabled?: boolean;
  ipv4Address?: string;
  ipv4SubnetMask?: string;
  ipv4Gateway?: string;
  dnsServers?: string[];
}): Promise<string> {
  const client = getActiveClient();

  const updates: Record<string, string> = {};
  if (input.hostname !== undefined) updates["root.Network.HostName"] = input.hostname;
  if (input.ipv4Address !== undefined) updates["root.Network.eth0.IPAddress"] = input.ipv4Address;
  if (input.ipv4SubnetMask !== undefined) updates["root.Network.eth0.SubnetMask"] = input.ipv4SubnetMask;
  if (input.ipv4Gateway !== undefined) updates["root.Network.eth0.DefaultRouter"] = input.ipv4Gateway;

  if (Object.keys(updates).length === 0) return "No network settings provided to update";

  await client.setParams(updates);
  return `Updated ${Object.keys(updates).length} network setting(s)`;
}
