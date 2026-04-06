import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getUsers } from "../tools/users.js";

const mockCgiGet = vi.fn();

beforeEach(() => {
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
