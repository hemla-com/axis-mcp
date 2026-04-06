import sharp from "sharp";
import { getActiveClient } from "./connect.js";

export async function getSnapshot(input: {
  resolution?: string;
  camera?: number;
  compression?: number;
  maxWidth?: number;
}): Promise<{ base64: string; mimeType: string }> {
  const client = getActiveClient();

  const params: Record<string, string> = {};
  if (input.resolution) params.resolution = input.resolution;
  if (input.camera !== undefined) params.camera = String(input.camera);
  if (input.compression !== undefined) params.compression = String(input.compression);

  const raw = await client.requestRaw("/axis-cgi/jpg/image.cgi", params);

  const maxWidth = input.maxWidth ?? 1280;
  const resized = await sharp(raw)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return {
    base64: resized.toString("base64"),
    mimeType: "image/jpeg",
  };
}
