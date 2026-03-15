import type { StageCInput, StageExecutionResult } from "@/server/evaluation/types";

export async function runStageCMet(input: StageCInput): Promise<StageExecutionResult> {
  const score = input.reject ? 40 : 90;
  const flags = input.reject ? ["c:distribution_reject"] : [];
  const evidence = [`met_reject=${String(input.reject)}`, `p_value=${input.pValue.toFixed(5)}`];
  return {
    stage: "stage_c_met",
    score,
    flags,
    evidence,
    metrics: { reject: input.reject, pValue: input.pValue }
  };
}
