import { getActiveClient } from "./connect.js";

export async function getUsers(): Promise<string> {
  const client = getActiveClient();
  const text = await client.cgiGet("pwdgrp.cgi", { action: "get" });
  return text.trim() || "No user info returned";
}
