import { getActiveClient } from "./connect.js";

const SENSOR_PREFIX = "root.ImageSource.I0.Sensor.";

export async function getImageSettings(input: { channel?: number }): Promise<string> {
  const client = getActiveClient();
  const ch = input.channel ?? 0;
  const params = await client.getParams(`ImageSource.I${ch}.Sensor`);

  const lines: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    const shortKey = key.replace(`root.ImageSource.I${ch}.Sensor.`, "");
    lines.push(`${shortKey}: ${value}`);
  }
  return lines.join("\n") || "No image settings found";
}

export async function setImageSettings(input: {
  channel?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sharpness?: number;
  whiteBalance?: string;
  wdr?: string;
  exposure?: string;
}): Promise<string> {
  const client = getActiveClient();
  const ch = input.channel ?? 0;
  const prefix = `root.ImageSource.I${ch}.Sensor.`;

  const updates: Record<string, string> = {};
  if (input.brightness !== undefined) updates[`${prefix}Brightness`] = String(input.brightness);
  if (input.contrast !== undefined) updates[`${prefix}Contrast`] = String(input.contrast);
  if (input.saturation !== undefined) updates[`${prefix}ColorLevel`] = String(input.saturation);
  if (input.sharpness !== undefined) updates[`${prefix}Sharpness`] = String(input.sharpness);
  if (input.whiteBalance !== undefined) updates[`${prefix}WhiteBalance`] = input.whiteBalance;
  if (input.wdr !== undefined) updates[`${prefix}WDR`] = input.wdr;
  if (input.exposure !== undefined) updates[`${prefix}Exposure`] = input.exposure;

  if (Object.keys(updates).length === 0) {
    return "No settings provided to update";
  }

  await client.setParams(updates);
  return `Updated ${Object.keys(updates).length} image setting(s)`;
}
