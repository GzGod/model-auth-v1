import type { StageDInput, StageExecutionResult } from "@/server/evaluation/types";

export async function runStageDVolatility(input: StageDInput): Promise<StageExecutionResult> {
  const flags: string[] = [];
  if (input.accuracyStdDev > 5) flags.push("d:accuracy_volatility");
  if (input.latencyCv > 0.15) flags.push("d:latency_volatility");

  let score = 100;
  if (flags.length > 0) score -= 25 * flags.length;

  return {
    stage: "stage_d_volatility",
    score: Math.max(0, score),
    flags,
    evidence: [`accuracy_std_dev=${input.accuracyStdDev}`, `latency_cv=${input.latencyCv}`],
    metrics: { accuracyStdDev: input.accuracyStdDev, latencyCv: input.latencyCv }
  };
}
