import { describe, it, expect, vi, beforeEach } from "vitest";

const mockJsonRequest = vi.fn();

vi.mock("../vapix/client.js", () => ({
  VapixClient: vi.fn().mockImplementation(function () {
    return { jsonRequest: mockJsonRequest };
  }),
}));

import { connectCamera, getActiveClient, setActiveClient } from "../tools/connect.js";

beforeEach(() => {
  setActiveClient(null as any);
  mockJsonRequest.mockResolvedValue({
    propertyList: {
      ProdFullName: "AXIS M1075-L Box Camera",
      SerialNumber: "B8A44FF1BA1C",
      Version: "12.6.104",
      Brand: "AXIS",
    },
  });
});

describe("connectCamera", () => {
  it("connects and returns device summary", async () => {
    const result = await connectCamera({
      host: "192.168.1.100",
      username: "root",
      password: "pass",
    });
    expect(result).toContain("AXIS M1075-L Box Camera");
    expect(result).toContain("B8A44FF1BA1C");
    expect(result).toContain("12.6.104");
  });

  it("sets the active client after connecting", async () => {
    await connectCamera({
      host: "192.168.1.100",
      username: "root",
      password: "pass",
    });
    expect(getActiveClient()).toBeDefined();
  });

  it("throws when no client is connected", () => {
    expect(() => getActiveClient()).toThrow("No camera connected");
  });
});
