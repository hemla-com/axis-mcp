#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { connectCamera } from "./tools/connect.js";
import { getDeviceInfo } from "./tools/device-info.js";
import { getSnapshot } from "./tools/snapshot.js";
import { getImageSettings, setImageSettings } from "./tools/image-settings.js";
import { getOverlay, addTextOverlay, removeOverlay } from "./tools/overlay.js";
import { getDateTime, setDateTime, getNtp, setNtp } from "./tools/datetime.js";
import { getNetworkInfo, getNetworkConfig, setNetworkConfig } from "./tools/network.js";
import { rebootCamera, getSystemLog, getAccessLog, getServerReport, factoryDefault } from "./tools/system.js";
import { getStreamProfiles, createStreamProfile, updateStreamProfile, removeStreamProfile } from "./tools/stream-profile.js";
import { getUsers, createUser, updateUser, removeUser, setupInitialUser } from "./tools/users.js";
import { getStorageInfo } from "./tools/storage.js";
import { discoverApis } from "./tools/discovery.js";
import { getPtzPosition, setPtzPosition, ptzMove, getPtzPresets, gotoPtzPreset } from "./tools/ptz.js";
import { getCaptureMode } from "./tools/capture-mode.js";

const server = new McpServer({
  name: "axis-camera",
  version: "0.1.0",
});

function toolError(err: unknown) {
  return {
    content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
    isError: true as const,
  };
}

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;
const SAFE_WRITE = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;
const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true } as const;

// ── Connection ──────────────────────────────────────────────────

server.registerTool("connect_camera", {
  description: "Connect to an Axis IP camera via VAPIX. Must be called before other tools.",
  inputSchema: {
    host: z.string().describe("Camera IP address or hostname"),
    username: z.string().describe("Camera username"),
    password: z.string().describe("Camera password"),
    port: z.number().optional().default(80).describe("HTTP port (default 80)"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await connectCamera(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── Device Info ─────────────────────────────────────────────────

server.registerTool("get_device_info", {
  description: "Get detailed device information (model, serial, firmware, etc.).",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getDeviceInfo();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── API Discovery ───────────────────────────────────────────────

server.registerTool("discover_apis", {
  description: "Discover all VAPIX APIs supported by the connected camera.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await discoverApis();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── Snapshot ────────────────────────────────────────────────────

server.registerTool("get_snapshot", {
  description: "Capture a JPEG snapshot from the camera.",
  inputSchema: {
    resolution: z.string().optional().describe("Resolution (e.g. 1920x1080)"),
    camera: z.number().optional().describe("Video source/channel (default 1)"),
    compression: z.number().optional().describe("JPEG compression 0-100"),
    maxWidth: z.number().optional().default(1280).describe("Max width in pixels for resizing (default 1280)"),
  },
  annotations: READ_ONLY,
}, async (args) => {
  try {
    const { base64, mimeType } = await getSnapshot(args);
    return { content: [{ type: "image", data: base64, mimeType }] };
  } catch (err) { return toolError(err); }
});

// ── Image Settings ──────────────────────────────────────────────

server.registerTool("get_image_settings", {
  description: "Get current image sensor settings (brightness, contrast, white balance, etc.).",
  inputSchema: {
    channel: z.number().optional().default(0).describe("Image source channel (default 0)"),
  },
  annotations: READ_ONLY,
}, async (args) => {
  try {
    const result = await getImageSettings(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("set_image_settings", {
  description: "Update image sensor settings (brightness, contrast, white balance, WDR, exposure, etc.).",
  inputSchema: {
    channel: z.number().optional().default(0).describe("Image source channel (default 0)"),
    brightness: z.number().min(0).max(100).optional().describe("Brightness 0-100"),
    contrast: z.number().min(0).max(100).optional().describe("Contrast 0-100"),
    saturation: z.number().min(0).max(100).optional().describe("Color saturation 0-100"),
    sharpness: z.number().min(0).max(100).optional().describe("Sharpness 0-100"),
    whiteBalance: z.string().optional().describe("White balance mode (auto, manual, hold, fixed_indoor, etc.)"),
    wdr: z.string().optional().describe("Wide Dynamic Range (on/off)"),
    exposure: z.string().optional().describe("Exposure mode (auto, flickerfree50, flickerfree60, hold)"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await setImageSettings(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── Overlay ─────────────────────────────────────────────────────

server.registerTool("get_overlay", {
  description: "Get text and image overlays configured on the video stream. Queries all cameras by default.",
  inputSchema: {
    camera: z.number().optional().describe("Camera/channel to query (omit to query all cameras)"),
  },
  annotations: READ_ONLY,
}, async (args) => {
  try {
    const result = await getOverlay(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("add_text_overlay", {
  description: "Add a text overlay to the video stream. Supports format modifiers like %F (date), %T (time).",
  inputSchema: {
    camera: z.number().optional().default(0).describe("Camera/channel (default 0)"),
    text: z.string().describe("Overlay text (supports modifiers: %F=date, %T=time, %X=time, %x=date)"),
    position: z.string().optional().describe("Named position: topLeft, topRight, bottomLeft, bottomRight, top, bottom"),
    x: z.number().optional().describe("X position (used if position not set)"),
    y: z.number().optional().describe("Y position (used if position not set)"),
    fontSize: z.number().optional().describe("Font size"),
    color: z.string().optional().describe("Text color (e.g. white, black, red)"),
    backgroundColor: z.string().optional().describe("Background color (e.g. transparent, black)"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await addTextOverlay(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("remove_overlay", {
  description: "Remove an overlay by its identity number.",
  inputSchema: {
    identity: z.number().describe("Overlay identity number to remove"),
  },
  annotations: DESTRUCTIVE,
}, async (args) => {
  try {
    const result = await removeOverlay(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── Date, Time & NTP ────────────────────────────────────────────

server.registerTool("get_datetime", {
  description: "Get the camera's current date, time, and timezone.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getDateTime();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("set_datetime", {
  description: "Set the camera's date, time, or timezone.",
  inputSchema: {
    dateTime: z.string().optional().describe("Date/time string"),
    timeZone: z.string().optional().describe("Timezone (e.g. Europe/Stockholm)"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await setDateTime(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("get_ntp", {
  description: "Get NTP (time synchronization) configuration.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getNtp();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("set_ntp", {
  description: "Configure NTP time synchronization.",
  inputSchema: {
    enabled: z.boolean().optional().describe("Enable/disable NTP client"),
    serversSource: z.string().optional().describe("Server source: 'static' or 'DHCP'"),
    staticServers: z.array(z.string()).optional().describe("List of NTP server addresses"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await setNtp(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── Network ─────────────────────────────────────────────────────

server.registerTool("get_network_info", {
  description: "Get network parameters (IP, DNS, hostname, etc.) via legacy param.cgi.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getNetworkInfo();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("get_network_config", {
  description: "Get network configuration via the modern Network Settings API.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getNetworkConfig();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("set_network_config", {
  description: "Update network settings (hostname, IP, subnet, gateway).",
  inputSchema: {
    hostname: z.string().optional().describe("Device hostname"),
    ipv4Address: z.string().optional().describe("IPv4 address"),
    ipv4SubnetMask: z.string().optional().describe("IPv4 subnet mask"),
    ipv4Gateway: z.string().optional().describe("IPv4 default gateway"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await setNetworkConfig(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── System ──────────────────────────────────────────────────────

server.registerTool("reboot_camera", {
  description: "Reboot the camera.",
  annotations: DESTRUCTIVE,
}, async () => {
  try {
    const result = await rebootCamera();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("get_system_log", {
  description: "Get the camera's system log.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getSystemLog();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("get_access_log", {
  description: "Get the camera's client access log.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getAccessLog();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("get_server_report", {
  description: "Get a detailed server report from the camera.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getServerReport();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("factory_default", {
  description: "Reset camera to factory defaults. WARNING: This is destructive and will reboot the camera.",
  inputSchema: {
    hard: z.boolean().optional().default(false).describe("Hard reset (true) resets ALL settings including IP. Soft reset (false) preserves some."),
  },
  annotations: DESTRUCTIVE,
}, async (args) => {
  try {
    const result = await factoryDefault(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── Stream Profiles ─────────────────────────────────────────────

server.registerTool("get_stream_profiles", {
  description: "List all stream profiles configured on the camera.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getStreamProfiles();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("create_stream_profile", {
  description: "Create a new stream profile with specified parameters.",
  inputSchema: {
    name: z.string().describe("Profile name"),
    description: z.string().optional().describe("Profile description"),
    parameters: z.string().describe("Stream parameters (e.g. 'resolution=1920x1080&fps=30&videocodec=h264')"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await createStreamProfile(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("update_stream_profile", {
  description: "Update an existing stream profile.",
  inputSchema: {
    name: z.string().describe("Profile name to update"),
    description: z.string().optional().describe("New description"),
    parameters: z.string().describe("New stream parameters"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await updateStreamProfile(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("remove_stream_profile", {
  description: "Remove a stream profile.",
  inputSchema: {
    name: z.string().describe("Profile name to remove"),
  },
  annotations: DESTRUCTIVE,
}, async (args) => {
  try {
    const result = await removeStreamProfile(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── Users ───────────────────────────────────────────────────────

server.registerTool("get_users", {
  description: "Get the list of user accounts and their groups.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getUsers();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("create_user", {
  description: "Create a new user account on the camera.",
  inputSchema: {
    user: z.string().describe("Username (1-14 chars, alphanumeric)"),
    password: z.string().describe("Password for the new user"),
    role: z.enum(["viewer", "operator", "admin"]).optional().default("viewer").describe("User role (viewer, operator, admin)"),
    ptz: z.boolean().optional().default(false).describe("Grant PTZ control"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await createUser(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("update_user", {
  description: "Update an existing user's password or role.",
  inputSchema: {
    user: z.string().describe("Username to update"),
    password: z.string().optional().describe("New password"),
    role: z.enum(["viewer", "operator", "admin"]).optional().describe("New role"),
    ptz: z.boolean().optional().describe("Grant/revoke PTZ control"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await updateUser(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("remove_user", {
  description: "Remove a user account from the camera.",
  inputSchema: {
    user: z.string().describe("Username to remove"),
  },
  annotations: DESTRUCTIVE,
}, async (args) => {
  try {
    const result = await removeUser(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("setup_initial_user", {
  description: "Set up the initial admin user on a factory-fresh Axis camera. Does NOT require connect_camera — connects directly without authentication.",
  inputSchema: {
    host: z.string().describe("Camera IP address or hostname"),
    password: z.string().describe("Password for the initial admin account"),
    username: z.string().optional().default("root").describe("Username (default 'root')"),
    port: z.number().optional().default(80).describe("HTTP port (default 80)"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await setupInitialUser(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── Storage ─────────────────────────────────────────────────────

server.registerTool("get_storage_info", {
  description: "Get information about storage/SD card on the camera.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getStorageInfo();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── Capture Mode ────────────────────────────────────────────────

server.registerTool("get_capture_mode", {
  description: "Get available capture modes (resolution/FPS combinations) for each channel.",
  annotations: READ_ONLY,
}, async () => {
  try {
    const result = await getCaptureMode();
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── PTZ ─────────────────────────────────────────────────────────

server.registerTool("get_ptz_position", {
  description: "Get current PTZ (Pan/Tilt/Zoom) position.",
  inputSchema: {
    camera: z.number().optional().default(1).describe("Camera/channel number (default 1)"),
  },
  annotations: READ_ONLY,
}, async (args) => {
  try {
    const result = await getPtzPosition(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("set_ptz_position", {
  description: "Set absolute PTZ position.",
  inputSchema: {
    camera: z.number().optional().describe("Camera/channel number"),
    pan: z.number().optional().describe("Pan position (-180 to 180)"),
    tilt: z.number().optional().describe("Tilt position (-180 to 180)"),
    zoom: z.number().optional().describe("Zoom level (1 to max)"),
    speed: z.number().optional().describe("Movement speed (1-100)"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await setPtzPosition(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("ptz_move", {
  description: "Send a relative PTZ move command (home, up, down, left, right, upleft, upright, downleft, downright, stop).",
  inputSchema: {
    camera: z.number().optional().describe("Camera/channel number"),
    move: z.string().describe("Move direction: home, up, down, left, right, upleft, upright, downleft, downright, stop"),
    speed: z.number().optional().describe("Movement speed (1-100)"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await ptzMove(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("get_ptz_presets", {
  description: "List all PTZ preset positions.",
  inputSchema: {
    camera: z.number().optional().default(1).describe("Camera/channel number (default 1)"),
  },
  annotations: READ_ONLY,
}, async (args) => {
  try {
    const result = await getPtzPresets(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

server.registerTool("goto_ptz_preset", {
  description: "Move camera to a named PTZ preset position.",
  inputSchema: {
    camera: z.number().optional().describe("Camera/channel number"),
    presetName: z.string().describe("Name of the preset to go to"),
    speed: z.number().optional().describe("Movement speed (1-100)"),
  },
  annotations: SAFE_WRITE,
}, async (args) => {
  try {
    const result = await gotoPtzPreset(args);
    return { content: [{ type: "text", text: result }] };
  } catch (err) { return toolError(err); }
});

// ── Server startup ──────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Axis MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
