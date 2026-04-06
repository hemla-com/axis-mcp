import { describe, it, expect, vi, beforeEach } from "vitest";
import { VapixClient } from "../vapix/client.js";

describe("VapixClient", () => {
  let client: VapixClient;

  beforeEach(() => {
    client = new VapixClient({
      host: "192.168.1.100",
      username: "root",
      password: "pass",
    });
  });

  it("constructs correct base URL", () => {
    expect((client as any).baseUrl).toBe("http://192.168.1.100:80");
  });

  it("constructs HTTPS URL when specified", () => {
    const c = new VapixClient({
      host: "192.168.1.100",
      username: "root",
      password: "pass",
      protocol: "https",
      port: 443,
    });
    expect((c as any).baseUrl).toBe("https://192.168.1.100:443");
  });

  describe("parseKeyValue", () => {
    it("parses key=value lines", () => {
      const result = VapixClient.parseKeyValue("root.Foo.Bar=123\nroot.Baz.Qux=hello\n");
      expect(result).toEqual({
        "root.Foo.Bar": "123",
        "root.Baz.Qux": "hello",
      });
    });

    it("skips comments and empty lines", () => {
      const result = VapixClient.parseKeyValue("# comment\n\nroot.A=1\n");
      expect(result).toEqual({ "root.A": "1" });
    });

    it("handles values with equals signs", () => {
      const result = VapixClient.parseKeyValue("root.A=x=y=z\n");
      expect(result).toEqual({ "root.A": "x=y=z" });
    });
  });
});
