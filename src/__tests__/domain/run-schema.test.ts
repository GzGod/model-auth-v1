import { describe, it, expect } from "vitest";
import { RiskLevel, StageName } from "@/server/types/domain";

describe("domain enums", () => {
  it("exposes canonical risk levels and stages", () => {
    expect(RiskLevel).toContain("high_risk");
    expect(StageName).toContain("stage_c_met");
  });
});
