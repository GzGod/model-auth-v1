import { describe, it, expect } from "vitest";
import { runStageAProtocol } from "@/server/evaluation/stageAProtocol";

describe("evaluation contracts", () => {
  it("returns stage result with score and flags", async () => {
    const result = await runStageAProtocol({ probes: [] });
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("flags");
  });
});
