import { describe, it, expect } from "vitest";
import { createAdapter } from "@/server/adapters/factory";

describe("adapter factory", () => {
  it("creates openai-compatible adapter", () => {
    const adapter = createAdapter({ providerType: "openai_compatible" });
    expect(adapter.name).toBe("openai_compatible");
  });
});
