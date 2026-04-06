import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getDeviceInfo } from "../tools/device-info.js";

const mockJsonRequest = vi.fn();

beforeEach(() => {
  mockJsonRequest.mockResolvedValue({
    propertyList: {
      Brand: "AXIS",
      ProdFullName: "AXIS M1075-L Box Camera",
      SerialNumber: "B8A44FF1BA1C",
      Version: "12.6.104",
      Architecture: "aarch64",
    },
  });
  setActiveClient({ jsonRequest: mockJsonRequest } as any);
});

describe("getDeviceInfo", () => {
  it("returns formatted device properties", async () => {
    const result = await getDeviceInfo();
    expect(result).toContain("Brand: AXIS");
    expect(result).toContain("ProdFullName: AXIS M1075-L Box Camera");
    expect(result).toContain("SerialNumber: B8A44FF1BA1C");
  });
});
