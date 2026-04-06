import { getActiveClient } from "./connect.js";

function formatPosition(pos: any): string {
  if (typeof pos === "string") return pos;
  if (pos && typeof pos.x === "number") return `(${pos.x}, ${pos.y})`;
  return String(pos ?? "unknown");
}

function formatTextOverlay(t: any): string {
  const parts = [
    `[${t.identity}] "${t.text}"`,
    `position=${formatPosition(t.position)}`,
    `visible=${t.visible}`,
  ];
  if (t.fontSize) parts.push(`fontSize=${t.fontSize}`);
  if (t.textColor) parts.push(`color=${t.textColor}`);
  if (t.textBGColor) parts.push(`bg=${t.textBGColor}`);
  return `  ${parts.join(" ")}`;
}

function formatImageOverlay(img: any): string {
  return `  [${img.identity}] ${img.imagePath} position=${formatPosition(img.position)} visible=${img.visible}`;
}

async function getCameraCount(): Promise<number> {
  try {
    const params = await getActiveClient().getParams("Image");
    const nStr = params["root.Image.NbrOfConfigs"];
    if (nStr) return parseInt(nStr, 10);
  } catch {}
  return 2;
}

async function listOverlaysForCamera(camera: number): Promise<{
  camera: number;
  textOverlays: any[];
  imageOverlays: any[];
  imageFiles: string[];
}> {
  const data = await getActiveClient().jsonRequest(
    "dynamicoverlay/dynamicoverlay.cgi",
    "list",
    { camera }
  );
  return {
    camera,
    textOverlays: data.textOverlays ?? [],
    imageOverlays: data.imageOverlays ?? [],
    imageFiles: data.imageFiles ?? [],
  };
}

export async function getOverlay(input: { camera?: number }): Promise<string> {
  try {
    const cameras: number[] = [];
    if (input.camera !== undefined) {
      cameras.push(input.camera);
    } else {
      const count = await getCameraCount();
      for (let i = 0; i < count; i++) cameras.push(i);
    }

    const allImageFiles = new Set<string>();
    const lines: string[] = [];
    let anySuccess = false;

    for (const cam of cameras) {
      try {
        const data = await listOverlaysForCamera(cam);
        anySuccess = true;

        const hasOverlays = data.textOverlays.length > 0 || data.imageOverlays.length > 0;
        if (!hasOverlays && cameras.length > 1) continue;

        if (cameras.length > 1) lines.push(`Camera ${cam}:`);

        if (data.textOverlays.length) {
          lines.push("  Text Overlays:");
          for (const t of data.textOverlays) lines.push(`  ${formatTextOverlay(t)}`);
        }
        if (data.imageOverlays.length) {
          lines.push("  Image Overlays:");
          for (const img of data.imageOverlays) lines.push(`  ${formatImageOverlay(img)}`);
        }
        for (const f of data.imageFiles) allImageFiles.add(f);
      } catch {}
    }

    if (!anySuccess) throw new Error("Dynamic overlay API not available");

    if (allImageFiles.size) {
      lines.push(`Available overlay images: ${[...allImageFiles].join(", ")}`);
    }

    if (lines.length === 0) lines.push("No overlays configured");

    return lines.join("\n");
  } catch {
    const params = await getActiveClient().getParams("Image.I0.Overlay");
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
  position?: string;
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
    visible: true,
  };

  if (input.position) {
    overlay.position = input.position;
  } else if (input.x !== undefined || input.y !== undefined) {
    overlay.position = { x: input.x ?? 0, y: input.y ?? 0 };
  } else {
    overlay.position = "topLeft";
  }

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
