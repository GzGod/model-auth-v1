import type { StageNameValue } from "@/server/types/domain";

export interface StageExecutionResult {
  stage: StageNameValue;
  score: number;
  flags: string[];
  evidence: string[];
  metrics?: Record<string, number | boolean>;
}

export interface StageAInput {
  probes: Array<{ name: string; passed: boolean; detail?: string }>;
}

export interface StageBInput {
  probes: Array<{ dimension: string; expected: number; observed: number }>;
}

export interface StageCInput {
  reject: boolean;
  pValue: number;
}

export interface StageDInput {
  accuracyStdDev: number;
  latencyCv: number;
}
