import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getOverlay, addTextOverlay, removeOverlay } from "../tools/overlay.js";

const mockJsonRequest = vi.fn();
const mockGetParams = vi.fn();

beforeEach(() => {
  setActiveClient({ jsonRequest: mockJsonRequest, getParams: mockGetParams } as any);
});

describe("getOverlay", () => {
  it("lists text overlays from dynamic API", async () => {
    mockJsonRequest.mockResolvedValue({
      textOverlays: [
        { identity: 1, text: "Hello", position: { x: 0, y: 0 }, visible: true },
      ],
      imageOverlays: [],
      imageFiles: ["/etc/overlays/axis.ovl"],
    });
    const result = await getOverlay({});
    expect(result).toContain("Hello");
    expect(result).toContain("[1]");
  });

  it("falls back to param.cgi on error", async () => {
    mockJsonRequest.mockRejectedValue(new Error("not supported"));
    mockGetParams.mockResolvedValue({ "root.Image.I0.Overlay.MaskWindows.Color": "black" });
    const result = await getOverlay({});
    expect(result).toContain("black");
  });
});

describe("addTextOverlay", () => {
  it("adds text overlay", async () => {
    mockJsonRequest.mockResolvedValue({ identity: 5 });
    const result = await addTextOverlay({ text: "Test" });
    expect(result).toContain("Text overlay added");
    expect(result).toContain("5");
  });
});

describe("removeOverlay", () => {
  it("removes overlay by identity", async () => {
    mockJsonRequest.mockResolvedValue({});
    const result = await removeOverlay({ identity: 5 });
    expect(result).toContain("Overlay 5 removed");
  });
});
