export const RiskLevel = ["trusted", "suspicious", "high_risk", "inconclusive"] as const;
export type RiskLevelValue = (typeof RiskLevel)[number];

export const StageName = ["stage_a_protocol", "stage_b_capability", "stage_c_met", "stage_d_volatility"] as const;
export type StageNameValue = (typeof StageName)[number];

export const ProviderType = ["openai_compatible", "anthropic", "gemini", "azure_openai", "custom"] as const;
export type ProviderTypeValue = (typeof ProviderType)[number];

export const RunMode = ["quick", "deep"] as const;
export type RunModeValue = (typeof RunMode)[number];

export interface EndpointConfig {
  providerType: ProviderTypeValue;
  baseUrl: string;
  apiKey?: string;
  modelClaim: string;
  adapterMapping?: Record<string, unknown>;
}

export interface RunConfig {
  mode: RunModeValue;
  maxBudgetTokens?: number;
  targetFamily?: string;
  languageMix?: "zh_en" | "en" | "zh";
}

export interface StageResult {
  stage: StageNameValue;
  score: number;
  flags: string[];
  evidence: string[];
}

export interface RunResult {
  runId: string;
  riskLevel: RiskLevelValue;
  confidence: number;
  finalScore: number;
  stageResults: StageResult[];
}
