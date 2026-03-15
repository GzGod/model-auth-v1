import { describe, it, expect } from "vitest";
import { computeVerdict } from "@/server/scoring/finalVerdict";

describe("final verdict", () => {
  it("returns high_risk when hard red flag triggered", () => {
    const verdict = computeVerdict({
      scores: { a: 85, b: 70, c: 40, d: 80 },
      flags: ["hard:redflag:met_and_capability_drop"]
    });

    expect(verdict.riskLevel).toBe("high_risk");
  });
});
