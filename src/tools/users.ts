import { getActiveClient } from "./connect.js";

export async function getUsers(): Promise<string> {
  const client = getActiveClient();
  const text = await client.cgiGet("pwdgrp.cgi", { action: "get" });
  return text.trim() || "No user info returned";
}

function buildSgrp(role: string, ptz: boolean): string {
  const groups: string[] = [];
  if (role === "admin") groups.push("admin", "operator", "viewer");
  else if (role === "operator") groups.push("operator", "viewer");
  else groups.push("viewer");
  if (ptz) groups.push("ptz");
  return groups.join(":");
}

export async function createUser(input: {
  user: string;
  password: string;
  role?: string;
  ptz?: boolean;
}): Promise<string> {
  const client = getActiveClient();
  const role = input.role ?? "viewer";
  const ptz = input.ptz ?? false;
  const sgrp = buildSgrp(role, ptz);

  const text = await client.cgiGet("pwdgrp.cgi", {
    action: "add",
    user: input.user,
    pwd: input.password,
    grp: "users",
    sgrp,
  });
  return text.trim() || `User "${input.user}" created (${role}, ptz=${ptz})`;
}

export async function updateUser(input: {
  user: string;
  password?: string;
  role?: string;
  ptz?: boolean;
}): Promise<string> {
  const client = getActiveClient();
  const params: Record<string, string> = {
    action: "update",
    user: input.user,
  };
  if (input.password) params.pwd = input.password;
  if (input.role !== undefined) {
    params.sgrp = buildSgrp(input.role, input.ptz ?? false);
  }

  const text = await client.cgiGet("pwdgrp.cgi", params);
  return text.trim() || `User "${input.user}" updated`;
}

export async function removeUser(input: { user: string }): Promise<string> {
  const client = getActiveClient();
  const text = await client.cgiGet("pwdgrp.cgi", {
    action: "remove",
    user: input.user,
  });
  return text.trim() || `User "${input.user}" removed`;
}

export async function setupInitialUser(input: {
  host: string;
  password: string;
  username?: string;
  port?: number;
}): Promise<string> {
  const username = input.username ?? "root";
  const port = input.port ?? 80;
  const sgrp = "admin:operator:viewer:ptz";

  const url = new URL(`http://${input.host}:${port}/axis-cgi/pwdgrp.cgi`);
  url.searchParams.set("action", "add");
  url.searchParams.set("user", username);
  url.searchParams.set("pwd", input.password);
  url.searchParams.set("grp", "root");
  url.searchParams.set("sgrp", sgrp);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Initial user setup failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`);
  }
  const text = await res.text();
  return text.trim() || `Initial admin user "${username}" created on ${input.host}`;
}
