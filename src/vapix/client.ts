import DigestClient from "digest-fetch";

export interface VapixClientOptions {
  host: string;
  username: string;
  password: string;
  port?: number;
  protocol?: "http" | "https";
}

export class VapixClient {
  private client: DigestClient;
  private baseUrl: string;

  constructor(private options: VapixClientOptions) {
    this.client = new DigestClient(options.username, options.password);
    const protocol = options.protocol ?? "http";
    const port = options.port ?? 80;
    this.baseUrl = `${protocol}://${options.host}:${port}`;
  }

  async jsonRequest(cgi: string, method: string, params?: object): Promise<any> {
    const url = `${this.baseUrl}/axis-cgi/${cgi}`;
    const body: any = {
      apiVersion: "1.0",
      method,
    };
    if (params) body.params = params;

    const res = await this.client.fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`VAPIX ${cgi}/${method} failed: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    if (json.error) {
      throw new Error(`VAPIX ${cgi}/${method} error ${json.error.code}: ${json.error.message}`);
    }
    return json.data ?? json;
  }

  async getParams(group: string): Promise<Record<string, string>> {
    const url = `${this.baseUrl}/axis-cgi/param.cgi?action=list&group=${encodeURIComponent(group)}`;
    const res = await this.client.fetch(url);

    if (!res.ok) {
      throw new Error(`VAPIX param.cgi list ${group} failed: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    return VapixClient.parseKeyValue(text);
  }

  async setParams(params: Record<string, string>): Promise<void> {
    const pairs = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    const url = `${this.baseUrl}/axis-cgi/param.cgi?action=update&${pairs}`;
    const res = await this.client.fetch(url);

    if (!res.ok) {
      throw new Error(`VAPIX param.cgi update failed: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    if (!text.trim().startsWith("OK")) {
      throw new Error(`VAPIX param.cgi update failed: ${text.trim()}`);
    }
  }

  async requestRaw(path: string, queryParams?: Record<string, string>): Promise<Buffer> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (queryParams) {
      for (const [k, v] of Object.entries(queryParams)) {
        url.searchParams.set(k, v);
      }
    }
    const res = await this.client.fetch(url.toString());

    if (!res.ok) {
      throw new Error(`VAPIX ${path} failed: ${res.status} ${res.statusText}`);
    }

    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  }

  async cgiGet(path: string, params?: Record<string, string>): Promise<string> {
    const url = new URL(`${this.baseUrl}/axis-cgi/${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }
    const res = await this.client.fetch(url.toString());

    if (!res.ok) {
      throw new Error(`VAPIX ${path} failed: ${res.status} ${res.statusText}`);
    }

    return res.text();
  }

  static parseKeyValue(text: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      result[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
    }
    return result;
  }
}
