import type { StageBInput, StageExecutionResult } from "@/server/evaluation/types";

export async function runStageBCapability(input: StageBInput): Promise<StageExecutionResult> {
  if (input.probes.length === 0) {
    return {
      stage: "stage_b_capability",
      score: 100,
      flags: [],
      evidence: ["no capability probes configured"],
      metrics: { degradation: 0 }
    };
  }

  const gaps = input.probes.map((probe) => Math.max(0, probe.expected - probe.observed));
  const avgGap = gaps.reduce((acc, value) => acc + value, 0) / gaps.length;
  const score = Math.max(0, Math.round(100 - avgGap * 100));
  const flags = input.probes
    .filter((probe) => probe.observed < probe.expected * 0.75)
    .map((probe) => `b:${probe.dimension}:drop`);

  return {
    stage: "stage_b_capability",
    score,
    flags,
    evidence: input.probes.map((probe) => `${probe.dimension}:${probe.observed.toFixed(2)}/${probe.expected.toFixed(2)}`),
    metrics: { avgGap }
  };
}
