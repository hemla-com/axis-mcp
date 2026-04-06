import { getActiveClient } from "./connect.js";

export async function getPtzPosition(input: { camera?: number }): Promise<string> {
  const client = getActiveClient();
  const cam = input.camera ?? 1;
  const text = await client.cgiGet("com/ptz.cgi", { query: "position", camera: String(cam) });
  return text.trim() || "No PTZ position data";
}

export async function setPtzPosition(input: {
  camera?: number;
  pan?: number;
  tilt?: number;
  zoom?: number;
  speed?: number;
}): Promise<string> {
  const client = getActiveClient();
  const params: Record<string, string> = {};
  if (input.camera !== undefined) params.camera = String(input.camera);
  if (input.pan !== undefined) params.pan = String(input.pan);
  if (input.tilt !== undefined) params.tilt = String(input.tilt);
  if (input.zoom !== undefined) params.zoom = String(input.zoom);
  if (input.speed !== undefined) params.speed = String(input.speed);

  const text = await client.cgiGet("com/ptz.cgi", params);
  return text.trim() || "PTZ position updated";
}

export async function ptzMove(input: {
  camera?: number;
  move: string;
  speed?: number;
}): Promise<string> {
  const client = getActiveClient();
  const params: Record<string, string> = {
    move: input.move,
  };
  if (input.camera !== undefined) params.camera = String(input.camera);
  if (input.speed !== undefined) params.speed = String(input.speed);

  const text = await client.cgiGet("com/ptz.cgi", params);
  return text.trim() || `PTZ move '${input.move}' sent`;
}

export async function getPtzPresets(input: { camera?: number }): Promise<string> {
  const client = getActiveClient();
  const cam = input.camera ?? 1;
  const text = await client.cgiGet("com/ptz.cgi", {
    query: "presetposall",
    camera: String(cam),
  });
  return text.trim() || "No PTZ presets found";
}

export async function gotoPtzPreset(input: {
  camera?: number;
  presetName: string;
  speed?: number;
}): Promise<string> {
  const client = getActiveClient();
  const params: Record<string, string> = {
    gotoserverpresetname: input.presetName,
  };
  if (input.camera !== undefined) params.camera = String(input.camera);
  if (input.speed !== undefined) params.speed = String(input.speed);

  const text = await client.cgiGet("com/ptz.cgi", params);
  return text.trim() || `Moved to preset '${input.presetName}'`;
}
