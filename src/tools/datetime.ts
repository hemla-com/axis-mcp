import { getActiveClient } from "./connect.js";

export async function getDateTime(): Promise<string> {
  const client = getActiveClient();
  try {
    const data = await client.jsonRequest("time.cgi", "getDateTimeInfo");
    const lines: string[] = [];
    if (data.dateTime) lines.push(`DateTime: ${data.dateTime}`);
    if (data.timeZone) lines.push(`TimeZone: ${data.timeZone}`);
    if (data.dstEnabled !== undefined) lines.push(`DST Enabled: ${data.dstEnabled}`);
    if (data.localTime) lines.push(`Local Time: ${data.localTime}`);
    if (data.utcTime) lines.push(`UTC Time: ${data.utcTime}`);
    return lines.join("\n") || JSON.stringify(data, null, 2);
  } catch {
    const params = await client.getParams("Time");
    const lines: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      lines.push(`${key}: ${value}`);
    }
    return lines.join("\n") || "No datetime info found";
  }
}

export async function setDateTime(input: {
  dateTime?: string;
  timeZone?: string;
}): Promise<string> {
  const client = getActiveClient();
  const params: any = {};
  if (input.dateTime) params.dateTime = input.dateTime;
  if (input.timeZone) params.timeZone = input.timeZone;

  await client.jsonRequest("time.cgi", "setDateTimeInfo", params);
  return "Date/time updated";
}

export async function getNtp(): Promise<string> {
  const client = getActiveClient();
  const data = await client.jsonRequest("ntp.cgi", "getNTPInfo");

  const lines: string[] = [];
  const c = data.client;
  if (c) {
    lines.push(`Enabled: ${c.enabled}`);
    lines.push(`NTS Enabled: ${c.NTSEnabled ?? "N/A"}`);
    lines.push(`Server Source: ${c.serversSource}`);
    if (c.staticServers?.length) lines.push(`Static Servers: ${c.staticServers.join(", ")}`);
    if (c.advertisedServers?.length) lines.push(`DHCP Servers: ${c.advertisedServers.join(", ")}`);
    lines.push(`Synced: ${c.synced}`);
    if (c.timeOffset !== undefined) lines.push(`Time Offset: ${c.timeOffset}ms`);
    if (c.timeToNextSync !== undefined) lines.push(`Next Sync: ${c.timeToNextSync}s`);
  }
  return lines.join("\n") || JSON.stringify(data, null, 2);
}

export async function setNtp(input: {
  enabled?: boolean;
  serversSource?: string;
  staticServers?: string[];
}): Promise<string> {
  const client = getActiveClient();
  const params: any = {};
  if (input.enabled !== undefined) params.enabled = input.enabled;
  if (input.serversSource) params.serversSource = input.serversSource;
  if (input.staticServers) params.staticServers = input.staticServers;

  await client.jsonRequest("ntp.cgi", "setNTPClientConfiguration", params);
  return "NTP configuration updated";
}
