import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getSnapshot } from "../tools/snapshot.js";

vi.mock("sharp", () => {
  const resizeMock = vi.fn().mockReturnThis();
  const jpegMock = vi.fn().mockReturnThis();
  const toBufferMock = vi.fn().mockResolvedValue(Buffer.from("fake-jpeg"));
  return {
    default: vi.fn(() => ({
      resize: resizeMock,
      jpeg: jpegMock,
      toBuffer: toBufferMock,
    })),
  };
});

const mockRequestRaw = vi.fn();

beforeEach(() => {
  mockRequestRaw.mockResolvedValue(Buffer.from("raw-image-data"));
  setActiveClient({ requestRaw: mockRequestRaw } as any);
});

describe("getSnapshot", () => {
  it("returns base64 image", async () => {
    const result = await getSnapshot({});
    expect(result.mimeType).toBe("image/jpeg");
    expect(result.base64).toBeDefined();
    expect(mockRequestRaw).toHaveBeenCalledWith("/axis-cgi/jpg/image.cgi", {});
  });

  it("passes resolution parameter", async () => {
    await getSnapshot({ resolution: "640x360" });
    expect(mockRequestRaw).toHaveBeenCalledWith("/axis-cgi/jpg/image.cgi", {
      resolution: "640x360",
    });
  });
});
