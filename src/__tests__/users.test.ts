import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getUsers, createUser, updateUser, removeUser, setupInitialUser } from "../tools/users.js";

const mockCgiGet = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  setActiveClient({ cgiGet: mockCgiGet } as any);
});

describe("getUsers", () => {
  it("returns user list", async () => {
    mockCgiGet.mockResolvedValue('admin="root"\noperator="root"\nviewer="root"\n');
    const result = await getUsers();
    expect(result).toContain("admin");
    expect(result).toContain("root");
    expect(mockCgiGet).toHaveBeenCalledWith("pwdgrp.cgi", { action: "get" });
  });
});

describe("createUser", () => {
  it("creates a viewer user without ptz", async () => {
    mockCgiGet.mockResolvedValue('Created account joe.');
    const result = await createUser({ user: "joe", password: "secret123" });
    expect(result).toContain("joe");
    expect(mockCgiGet).toHaveBeenCalledWith("pwdgrp.cgi", {
      action: "add",
      user: "joe",
      pwd: "secret123",
      grp: "users",
      sgrp: "viewer",
    });
  });

  it("creates an admin user with ptz", async () => {
    mockCgiGet.mockResolvedValue('Created account admin2.');
    const result = await createUser({ user: "admin2", password: "pass", role: "admin", ptz: true });
    expect(result).toContain("admin2");
    expect(mockCgiGet).toHaveBeenCalledWith("pwdgrp.cgi", {
      action: "add",
      user: "admin2",
      pwd: "pass",
      grp: "users",
      sgrp: "admin:operator:viewer:ptz",
    });
  });

  it("creates an operator user with ptz", async () => {
    mockCgiGet.mockResolvedValue("");
    const result = await createUser({ user: "op1", password: "pass", role: "operator", ptz: true });
    expect(result).toContain("op1");
    expect(mockCgiGet).toHaveBeenCalledWith("pwdgrp.cgi", expect.objectContaining({
      sgrp: "operator:viewer:ptz",
    }));
  });
});

describe("updateUser", () => {
  it("updates password", async () => {
    mockCgiGet.mockResolvedValue("OK");
    const result = await updateUser({ user: "joe", password: "newpass" });
    expect(result).toContain("OK");
    expect(mockCgiGet).toHaveBeenCalledWith("pwdgrp.cgi", {
      action: "update",
      user: "joe",
      pwd: "newpass",
    });
  });

  it("updates role", async () => {
    mockCgiGet.mockResolvedValue("");
    const result = await updateUser({ user: "joe", role: "operator", ptz: true });
    expect(result).toContain("joe");
    expect(mockCgiGet).toHaveBeenCalledWith("pwdgrp.cgi", {
      action: "update",
      user: "joe",
      sgrp: "operator:viewer:ptz",
    });
  });
});

describe("removeUser", () => {
  it("removes user by name", async () => {
    mockCgiGet.mockResolvedValue("Removed account joe.");
    const result = await removeUser({ user: "joe" });
    expect(result).toContain("joe");
    expect(mockCgiGet).toHaveBeenCalledWith("pwdgrp.cgi", {
      action: "remove",
      user: "joe",
    });
  });
});

describe("setupInitialUser", () => {
  it("calls unauthenticated endpoint for fresh camera", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("Created account root."),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await setupInitialUser({ host: "192.168.1.100", password: "mypass" });
    expect(result).toContain("root");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("192.168.1.100"));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("action=add"));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("user=root"));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("grp=root"));

    vi.unstubAllGlobals();
  });

  it("throws on HTTP error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      statusText: "Conflict",
      text: () => Promise.resolve("User already exists"),
    }));

    await expect(setupInitialUser({ host: "192.168.1.100", password: "pass" }))
      .rejects.toThrow("Initial user setup failed");

    vi.unstubAllGlobals();
  });
});
