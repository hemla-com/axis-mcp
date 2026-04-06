import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { rebootCamera, getSystemLog, getAccessLog, getServerReport, factoryDefault } from "../tools/system.js";

const mockCgiGet = vi.fn();

beforeEach(() => {
  setActiveClient({ cgiGet: mockCgiGet } as any);
});

describe("rebootCamera", () => {
  it("calls restart.cgi", async () => {
    mockCgiGet.mockResolvedValue("");
    const result = await rebootCamera();
    expect(result).toContain("rebooting");
    expect(mockCgiGet).toHaveBeenCalledWith("restart.cgi");
  });
});

describe("getSystemLog", () => {
  it("returns system log text", async () => {
    mockCgiGet.mockResolvedValue("2026-04-06 log entry here");
    const result = await getSystemLog();
    expect(result).toContain("2026-04-06");
  });
});

describe("getAccessLog", () => {
  it("returns access log text", async () => {
    mockCgiGet.mockResolvedValue("root accessed from 192.168.1.1");
    const result = await getAccessLog();
    expect(result).toContain("root accessed");
  });
});

describe("getServerReport", () => {
  it("truncates long reports", async () => {
    mockCgiGet.mockResolvedValue("x".repeat(15000));
    const result = await getServerReport();
    expect(result.length).toBeLessThan(11000);
    expect(result).toContain("truncated");
  });
});

describe("factoryDefault", () => {
  it("uses soft reset by default", async () => {
    mockCgiGet.mockResolvedValue("");
    const result = await factoryDefault({});
    expect(result).toContain("soft");
    expect(mockCgiGet).toHaveBeenCalledWith("factorydefault.cgi");
  });

  it("uses hard reset when specified", async () => {
    mockCgiGet.mockResolvedValue("");
    const result = await factoryDefault({ hard: true });
    expect(result).toContain("hard");
    expect(mockCgiGet).toHaveBeenCalledWith("hardfactorydefault.cgi");
  });
});
