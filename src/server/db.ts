import type { RiskLevelValue, RunModeValue, StageNameValue, StageResult } from "@/server/types/domain";

export interface RunRecord {
  id: string;
  providerType: string;
  baseUrl: string;
  modelClaim: string;
  mode: RunModeValue;
  status: "queued" | "running" | "completed" | "failed";
  riskLevel?: RiskLevelValue;
  finalScore?: number;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  stageResults: StageResult[];
}

const runs = new Map<string, RunRecord>();

export function createRun(
  input: Pick<RunRecord, "providerType" | "baseUrl" | "modelClaim" | "mode"> & { id?: string }
): RunRecord {
  const now = new Date().toISOString();
  const id = input.id ?? crypto.randomUUID();
  const record: RunRecord = {
    id,
    providerType: input.providerType,
    baseUrl: input.baseUrl,
    modelClaim: input.modelClaim,
    mode: input.mode,
    status: "queued",
    createdAt: now,
    updatedAt: now,
    stageResults: []
  };
  runs.set(id, record);
  return record;
}

export function updateRun(id: string, patch: Partial<RunRecord>): RunRecord | null {
  const existing = runs.get(id);
  if (!existing) return null;
  const updated: RunRecord = {
    ...existing,
    ...patch,
    id,
    updatedAt: new Date().toISOString()
  };
  runs.set(id, updated);
  return updated;
}

export function appendStageResult(
  runId: string,
  stage: StageNameValue,
  score: number,
  flags: string[],
  evidence: string[]
): RunRecord | null {
  const existing = runs.get(runId);
  if (!existing) return null;
  const stageResult: StageResult = { stage, score, flags, evidence };
  return updateRun(runId, { stageResults: [...existing.stageResults, stageResult] });
}

export function getRunById(id: string): RunRecord | null {
  return runs.get(id) ?? null;
}
