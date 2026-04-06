import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getNetworkInfo, getNetworkConfig, setNetworkConfig } from "../tools/network.js";

const mockGetParams = vi.fn();
const mockSetParams = vi.fn();
const mockJsonRequest = vi.fn();

beforeEach(() => {
  setActiveClient({ getParams: mockGetParams, setParams: mockSetParams, jsonRequest: mockJsonRequest } as any);
});

describe("getNetworkInfo", () => {
  it("returns network parameters", async () => {
    mockGetParams.mockResolvedValue({
      "root.Network.HostName": "axis-cam",
      "root.Network.IPAddress": "192.168.1.100",
    });
    const result = await getNetworkInfo();
    expect(result).toContain("axis-cam");
    expect(result).toContain("192.168.1.100");
  });
});

describe("getNetworkConfig", () => {
  it("returns JSON from network_settings.cgi", async () => {
    mockJsonRequest.mockResolvedValue({ ipv4: { address: "192.168.1.100" } });
    const result = await getNetworkConfig();
    expect(result).toContain("192.168.1.100");
  });
});

describe("setNetworkConfig", () => {
  it("updates hostname", async () => {
    const result = await setNetworkConfig({ hostname: "my-camera" });
    expect(result).toContain("1 network setting(s)");
    expect(mockSetParams).toHaveBeenCalledWith({ "root.Network.HostName": "my-camera" });
  });

  it("returns message when no settings provided", async () => {
    const result = await setNetworkConfig({});
    expect(result).toContain("No network settings");
  });
});
