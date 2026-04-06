import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getStorageInfo } from "../tools/storage.js";

const mockJsonRequest = vi.fn();
const mockGetParams = vi.fn();

beforeEach(() => {
  setActiveClient({ jsonRequest: mockJsonRequest, getParams: mockGetParams } as any);
});

describe("getStorageInfo", () => {
  it("tries JSON API first", async () => {
    mockJsonRequest.mockResolvedValue({ disks: [{ name: "SD_DISK" }] });
    const result = await getStorageInfo();
    expect(result).toContain("SD_DISK");
  });

  it("falls back to param.cgi", async () => {
    mockJsonRequest.mockRejectedValue(new Error("not supported"));
    mockGetParams.mockResolvedValue({
      "root.Storage.S0.DiskID": "SD_DISK",
      "root.Storage.S0.Enabled": "yes",
    });
    const result = await getStorageInfo();
    expect(result).toContain("SD_DISK");
    expect(result).toContain("yes");
  });
});
