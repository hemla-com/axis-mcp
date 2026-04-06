import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getOverlay, addTextOverlay, removeOverlay } from "../tools/overlay.js";

const mockJsonRequest = vi.fn();
const mockGetParams = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  setActiveClient({ jsonRequest: mockJsonRequest, getParams: mockGetParams } as any);
});

describe("getOverlay", () => {
  it("lists text overlays from a specific camera", async () => {
    mockJsonRequest.mockResolvedValue({
      textOverlays: [
        { identity: 1, text: "Hello", position: "topLeft", visible: true, fontSize: 36, textColor: "white" },
      ],
      imageOverlays: [],
      imageFiles: ["/etc/overlays/axis.ovl"],
    });
    const result = await getOverlay({ camera: 0 });
    expect(result).toContain("Hello");
    expect(result).toContain("[1]");
    expect(result).toContain("topLeft");
  });

  it("queries all cameras when no camera specified", async () => {
    mockGetParams.mockResolvedValue({ "root.Image.NbrOfConfigs": "2" });
    mockJsonRequest
      .mockResolvedValueOnce({ textOverlays: [], imageOverlays: [], imageFiles: ["/etc/overlays/axis.ovl"] })
      .mockResolvedValueOnce({
        textOverlays: [{ identity: 1, text: "%F %T", position: "topLeft", visible: true }],
        imageOverlays: [],
        imageFiles: ["/etc/overlays/axis.ovl"],
      });
    const result = await getOverlay({});
    expect(result).toContain("Camera 1");
    expect(result).toContain("%F %T");
  });

  it("falls back to param.cgi on error", async () => {
    mockJsonRequest.mockRejectedValue(new Error("not supported"));
    mockGetParams.mockImplementation((group: string) => {
      if (group === "Image") return Promise.resolve({ "root.Image.NbrOfConfigs": "1" });
      if (group === "Image.I0.Overlay") return Promise.resolve({ "root.Image.I0.Overlay.MaskWindows.Color": "black" });
      return Promise.reject(new Error("unknown group"));
    });
    const result = await getOverlay({});
    expect(result).toContain("black");
  });
});

describe("addTextOverlay", () => {
  it("adds text overlay with named position", async () => {
    mockJsonRequest.mockResolvedValue({ identity: 5 });
    const result = await addTextOverlay({ text: "Test", position: "topRight" });
    expect(result).toContain("Text overlay added");
    expect(result).toContain("5");
    expect(mockJsonRequest).toHaveBeenCalledWith(
      "dynamicoverlay/dynamicoverlay.cgi",
      "addText",
      expect.objectContaining({ position: "topRight" })
    );
  });

  it("adds text overlay with coordinate position", async () => {
    mockJsonRequest.mockResolvedValue({ identity: 6 });
    const result = await addTextOverlay({ text: "Test", x: 100, y: 200 });
    expect(result).toContain("6");
    expect(mockJsonRequest).toHaveBeenLastCalledWith(
      "dynamicoverlay/dynamicoverlay.cgi",
      "addText",
      expect.objectContaining({ position: [100, 200] })
    );
  });

  it("defaults to topLeft when no position given", async () => {
    mockJsonRequest.mockResolvedValue({ identity: 7 });
    await addTextOverlay({ text: "Test" });
    expect(mockJsonRequest).toHaveBeenCalledWith(
      "dynamicoverlay/dynamicoverlay.cgi",
      "addText",
      expect.objectContaining({ position: "topLeft" })
    );
  });
});

describe("removeOverlay", () => {
  it("removes overlay by identity", async () => {
    mockJsonRequest.mockResolvedValue({});
    const result = await removeOverlay({ identity: 5 });
    expect(result).toContain("Overlay 5 removed");
  });
});
