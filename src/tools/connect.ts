import { VapixClient } from "../vapix/client.js";

let activeClient: VapixClient | null = null;

export function getActiveClient(): VapixClient {
  if (!activeClient) {
    throw new Error("No camera connected. Call connect_camera first.");
  }
  return activeClient;
}

export function setActiveClient(client: VapixClient): void {
  activeClient = client;
}

export async function connectCamera(input: {
  host: string;
  username: string;
  password: string;
  port?: number;
}): Promise<string> {
  const client = new VapixClient({
    host: input.host,
    username: input.username,
    password: input.password,
    port: input.port,
  });

  const data = await client.jsonRequest("basicdeviceinfo.cgi", "getAllProperties");
  setActiveClient(client);

  const props = data.propertyList;
  const model = props.ProdFullName ?? props.ProdNbr ?? "unknown";
  const serial = props.SerialNumber ?? "unknown";
  const firmware = props.Version ?? "unknown";

  return [
    `Connected to ${model}`,
    `Serial: ${serial}`,
    `Firmware: ${firmware}`,
  ].join("\n");
}
