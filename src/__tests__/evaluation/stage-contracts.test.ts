import { describe, it, expect } from "vitest";
import { runStageAProtocol } from "@/server/evaluation/stageAProtocol";
import { runStageDVolatility } from "@/server/evaluation/stageDVolatility";

describe("evaluation contracts", () => {
  it("stage A computes score from failed probes", async () => {
    const result = await runStageAProtocol({
      probes: [
        { name: "shape", passed: true },
        { name: "error-format", passed: false, detail: "error envelope mismatch" }
      ]
    });

    expect(result.stage).toBe("stage_a_protocol");
    expect(result.score).toBe(50);
    expect(result.flags).toContain("a:error-format");
    expect(result.evidence).toContain("error envelope mismatch");
  });

  it("stage D flags volatility threshold breaches", async () => {
    const result = await runStageDVolatility({ accuracyStdDev: 6.2, latencyCv: 0.2 });

    expect(result.flags).toContain("d:accuracy_volatility");
    expect(result.flags).toContain("d:latency_volatility");
    expect(result.score).toBe(50);
  });
});
