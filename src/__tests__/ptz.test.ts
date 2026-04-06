import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getPtzPosition, setPtzPosition, ptzMove, getPtzPresets, gotoPtzPreset } from "../tools/ptz.js";

const mockCgiGet = vi.fn();

beforeEach(() => {
  setActiveClient({ cgiGet: mockCgiGet } as any);
});

describe("getPtzPosition", () => {
  it("returns position data", async () => {
    mockCgiGet.mockResolvedValue("pan=10.5\ntilt=-5.2\nzoom=1000\n");
    const result = await getPtzPosition({});
    expect(result).toContain("pan=10.5");
    expect(mockCgiGet).toHaveBeenCalledWith("com/ptz.cgi", { query: "position", camera: "1" });
  });
});

describe("setPtzPosition", () => {
  it("sets position with params", async () => {
    mockCgiGet.mockResolvedValue("");
    const result = await setPtzPosition({ pan: 10, tilt: -5, zoom: 1000 });
    expect(result).toContain("PTZ position updated");
  });
});

describe("ptzMove", () => {
  it("sends move command", async () => {
    mockCgiGet.mockResolvedValue("");
    const result = await ptzMove({ move: "home" });
    expect(result).toContain("home");
    expect(mockCgiGet).toHaveBeenCalledWith("com/ptz.cgi", { move: "home" });
  });
});

describe("getPtzPresets", () => {
  it("returns preset list", async () => {
    mockCgiGet.mockResolvedValue("presetposno1=Entrance\npresetposno2=Parking\n");
    const result = await getPtzPresets({});
    expect(result).toContain("Entrance");
    expect(result).toContain("Parking");
  });
});

describe("gotoPtzPreset", () => {
  it("sends goto preset command", async () => {
    mockCgiGet.mockResolvedValue("");
    const result = await gotoPtzPreset({ presetName: "Entrance" });
    expect(result).toContain("Entrance");
  });
});
