import type { StageAInput, StageExecutionResult } from "@/server/evaluation/types";

export async function runStageAProtocol(input: StageAInput): Promise<StageExecutionResult> {
  if (input.probes.length === 0) {
    return {
      stage: "stage_a_protocol",
      score: 100,
      flags: [],
      evidence: ["no protocol anomalies detected"],
      metrics: { passed: true }
    };
  }

  const failed = input.probes.filter((probe) => !probe.passed);
  const score = Math.max(0, Math.round((1 - failed.length / input.probes.length) * 100));
  return {
    stage: "stage_a_protocol",
    score,
    flags: failed.map((probe) => `a:${probe.name}`),
    evidence: failed.map((probe) => probe.detail ?? `${probe.name} failed`),
    metrics: { failed: failed.length, total: input.probes.length }
  };
}
