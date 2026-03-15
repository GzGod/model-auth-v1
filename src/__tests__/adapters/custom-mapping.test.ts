import { describe, it, expect } from "vitest";
import { endpointConfigSchema } from "@/server/validation/endpointConfig";

describe("custom mapping validation", () => {
  it("accepts custom adapter with response mapping", () => {
    const parsed = endpointConfigSchema.parse({
      providerType: "custom",
      baseUrl: "https://adapter.gateway.test",
      modelClaim: "gpt-5",
      adapterMapping: { responsePath: "choices.0.message.content" }
    });

    expect(parsed.providerType).toBe("custom");
  });
});
