import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { discoverApis } from "../tools/discovery.js";

const mockJsonRequest = vi.fn();

beforeEach(() => {
  setActiveClient({ jsonRequest: mockJsonRequest } as any);
});

describe("discoverApis", () => {
  it("lists discovered APIs", async () => {
    mockJsonRequest.mockResolvedValue({
      apiList: [
        { id: "basic-device-info", version: "1.2", status: "official", name: "Basic Device Info" },
        { id: "ntp", version: "1.5", status: "official", name: "NTP API" },
      ],
    });
    const result = await discoverApis();
    expect(result).toContain("Found 2 APIs");
    expect(result).toContain("basic-device-info");
    expect(result).toContain("ntp");
  });

  it("handles no APIs", async () => {
    mockJsonRequest.mockResolvedValue({ apiList: [] });
    const result = await discoverApis();
    expect(result).toContain("No APIs discovered");
  });
});
