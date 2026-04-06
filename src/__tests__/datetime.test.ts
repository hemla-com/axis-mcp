import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getDateTime, getNtp, setNtp, setDateTime } from "../tools/datetime.js";

const mockJsonRequest = vi.fn();
const mockGetParams = vi.fn();

beforeEach(() => {
  setActiveClient({ jsonRequest: mockJsonRequest, getParams: mockGetParams } as any);
});

describe("getDateTime", () => {
  it("returns formatted datetime from time.cgi", async () => {
    mockJsonRequest.mockResolvedValue({
      dateTime: "2026-04-06T07:27:20Z",
      timeZone: "Europe/Stockholm",
      dstEnabled: true,
    });
    const result = await getDateTime();
    expect(result).toContain("DateTime: 2026-04-06T07:27:20Z");
    expect(result).toContain("TimeZone: Europe/Stockholm");
  });
});

describe("getNtp", () => {
  it("returns formatted NTP info", async () => {
    mockJsonRequest.mockResolvedValue({
      client: {
        enabled: true,
        NTSEnabled: false,
        serversSource: "static",
        staticServers: ["0.pool.ntp.org"],
        advertisedServers: [],
        synced: true,
        timeOffset: 0.05,
        timeToNextSync: 300,
      },
    });
    const result = await getNtp();
    expect(result).toContain("Enabled: true");
    expect(result).toContain("Static Servers: 0.pool.ntp.org");
    expect(result).toContain("Synced: true");
  });
});

describe("setNtp", () => {
  it("calls setNTPClientConfiguration", async () => {
    mockJsonRequest.mockResolvedValue({});
    const result = await setNtp({ enabled: true, serversSource: "static", staticServers: ["ntp.example.com"] });
    expect(result).toContain("NTP configuration updated");
    expect(mockJsonRequest).toHaveBeenCalledWith("ntp.cgi", "setNTPClientConfiguration", {
      enabled: true,
      serversSource: "static",
      staticServers: ["ntp.example.com"],
    });
  });
});

describe("setDateTime", () => {
  it("calls setDateTimeInfo", async () => {
    mockJsonRequest.mockResolvedValue({});
    const result = await setDateTime({ timeZone: "UTC" });
    expect(result).toContain("Date/time updated");
  });
});
