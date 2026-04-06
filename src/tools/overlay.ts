import { getActiveClient } from "./connect.js";

export async function getOverlay(input: { camera?: number }): Promise<string> {
  const client = getActiveClient();
  const cam = input.camera ?? 0;

  try {
    const data = await client.jsonRequest(
      "dynamicoverlay/dynamicoverlay.cgi",
      "list",
      { camera: cam }
    );

    const lines: string[] = [];

    if (data.textOverlays?.length) {
      lines.push("Text Overlays:");
      for (const t of data.textOverlays) {
        lines.push(`  [${t.identity}] "${t.text}" at (${t.position?.x}, ${t.position?.y}) visible=${t.visible}`);
      }
    }

    if (data.imageOverlays?.length) {
      lines.push("Image Overlays:");
      for (const img of data.imageOverlays) {
        lines.push(`  [${img.identity}] ${img.imagePath} at (${img.position?.x}, ${img.position?.y}) visible=${img.visible}`);
      }
    }

    if (data.imageFiles?.length) {
      lines.push(`Available overlay images: ${data.imageFiles.join(", ")}`);
    }

    if (lines.length === 0) lines.push("No overlays configured");

    return lines.join("\n");
  } catch {
    const params = await client.getParams("Image.I0.Overlay");
    const lines: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      lines.push(`${key}: ${value}`);
    }
    return lines.join("\n") || "No overlay settings found";
  }
}

export async function addTextOverlay(input: {
  camera?: number;
  text: string;
  x?: number;
  y?: number;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
}): Promise<string> {
  const client = getActiveClient();
  const cam = input.camera ?? 0;

  const overlay: any = {
    camera: cam,
    text: input.text,
    position: { x: input.x ?? 0, y: input.y ?? 0 },
    visible: true,
  };
  if (input.fontSize !== undefined) overlay.fontSize = input.fontSize;
  if (input.color) overlay.textColor = input.color;
  if (input.backgroundColor) overlay.backgroundColor = input.backgroundColor;

  const data = await client.jsonRequest(
    "dynamicoverlay/dynamicoverlay.cgi",
    "addText",
    overlay
  );

  return `Text overlay added (id: ${data.identity ?? "unknown"})`;
}

export async function removeOverlay(input: {
  identity: number;
}): Promise<string> {
  const client = getActiveClient();
  await client.jsonRequest(
    "dynamicoverlay/dynamicoverlay.cgi",
    "remove",
    { identity: input.identity }
  );
  return `Overlay ${input.identity} removed`;
}
