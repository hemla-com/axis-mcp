import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getCaptureMode } from "../tools/capture-mode.js";

const mockJsonRequest = vi.fn();

beforeEach(() => {
  setActiveClient({ jsonRequest: mockJsonRequest } as any);
});

describe("getCaptureMode", () => {
  it("formats capture modes", async () => {
    mockJsonRequest.mockResolvedValue([
      {
        channel: 0,
        captureMode: [
          { captureModeId: 0, maxFPS: 30, enabled: true, description: "2MP (1920x1080) (16:9)" },
          { captureModeId: 1, maxFPS: 60, enabled: false, description: "1MP (1280x720) (16:9)" },
        ],
      },
    ]);
    const result = await getCaptureMode();
    expect(result).toContain("Channel 0");
    expect(result).toContain("2MP");
    expect(result).toContain("[ACTIVE]");
    expect(result).toContain("30 fps");
  });
});
