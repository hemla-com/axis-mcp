import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActiveClient } from "../tools/connect.js";
import { getStreamProfiles, createStreamProfile, updateStreamProfile, removeStreamProfile } from "../tools/stream-profile.js";

const mockJsonRequest = vi.fn();

beforeEach(() => {
  setActiveClient({ jsonRequest: mockJsonRequest } as any);
});

describe("getStreamProfiles", () => {
  it("lists profiles", async () => {
    mockJsonRequest.mockResolvedValue({
      streamProfile: [
        { name: "Profile1", description: "HD", parameters: "resolution=1920x1080" },
        { name: "Profile2", description: "SD", parameters: "resolution=640x360" },
      ],
      maxProfiles: 26,
    });
    const result = await getStreamProfiles();
    expect(result).toContain("Profile1");
    expect(result).toContain("resolution=1920x1080");
    expect(result).toContain("Max profiles: 26");
  });

  it("handles empty profiles", async () => {
    mockJsonRequest.mockResolvedValue({ streamProfile: [], maxProfiles: 26 });
    const result = await getStreamProfiles();
    expect(result).toContain("No stream profiles found");
  });
});

describe("createStreamProfile", () => {
  it("creates a profile", async () => {
    mockJsonRequest.mockResolvedValue({});
    const result = await createStreamProfile({ name: "Test", parameters: "resolution=640x360&fps=25" });
    expect(result).toContain("'Test' created");
  });
});

describe("updateStreamProfile", () => {
  it("updates a profile", async () => {
    mockJsonRequest.mockResolvedValue({});
    const result = await updateStreamProfile({ name: "Test", parameters: "resolution=1280x720" });
    expect(result).toContain("'Test' updated");
  });
});

describe("removeStreamProfile", () => {
  it("removes a profile", async () => {
    mockJsonRequest.mockResolvedValue({});
    const result = await removeStreamProfile({ name: "Test" });
    expect(result).toContain("'Test' removed");
  });
});
