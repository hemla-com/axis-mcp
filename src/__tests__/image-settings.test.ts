import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getImageSettings, setImageSettings } from "../tools/image-settings.js";

const mockGetParams = vi.fn();
const mockSetParams = vi.fn();

beforeEach(() => {
  mockGetParams.mockResolvedValue({
    "root.ImageSource.I0.Sensor.Brightness": "50",
    "root.ImageSource.I0.Sensor.Contrast": "50",
    "root.ImageSource.I0.Sensor.Sharpness": "50",
    "root.ImageSource.I0.Sensor.WhiteBalance": "auto",
  });
  mockSetParams.mockResolvedValue(undefined);
  setActiveClient({ getParams: mockGetParams, setParams: mockSetParams } as any);
});

describe("getImageSettings", () => {
  it("returns formatted settings", async () => {
    const result = await getImageSettings({});
    expect(result).toContain("Brightness: 50");
    expect(result).toContain("Contrast: 50");
    expect(result).toContain("WhiteBalance: auto");
  });
});

describe("setImageSettings", () => {
  it("updates brightness", async () => {
    const result = await setImageSettings({ brightness: 70 });
    expect(result).toContain("1 image setting(s)");
    expect(mockSetParams).toHaveBeenCalledWith({
      "root.ImageSource.I0.Sensor.Brightness": "70",
    });
  });

  it("returns message when no settings provided", async () => {
    const result = await setImageSettings({});
    expect(result).toContain("No settings provided");
  });
});
