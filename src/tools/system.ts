import { getActiveClient } from "./connect.js";

export async function rebootCamera(): Promise<string> {
  const client = getActiveClient();
  await client.cgiGet("restart.cgi");
  return "Camera is rebooting...";
}

export async function getSystemLog(): Promise<string> {
  const client = getActiveClient();
  return client.cgiGet("systemlog.cgi");
}

export async function getAccessLog(): Promise<string> {
  const client = getActiveClient();
  return client.cgiGet("accesslog.cgi");
}

export async function getServerReport(): Promise<string> {
  const client = getActiveClient();
  const report = await client.cgiGet("serverreport.cgi");
  if (report.length > 10000) {
    return report.slice(0, 10000) + "\n... (truncated)";
  }
  return report;
}

export async function factoryDefault(input: { hard?: boolean }): Promise<string> {
  const client = getActiveClient();
  const cgi = input.hard ? "hardfactorydefault.cgi" : "factorydefault.cgi";
  await client.cgiGet(cgi);
  return `Factory default (${input.hard ? "hard" : "soft"}) initiated. Camera will reboot.`;
}
