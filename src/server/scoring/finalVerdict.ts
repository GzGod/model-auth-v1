import type { RiskLevelValue } from "@/server/types/domain";
import { hasHardRedFlag, SCORE_WEIGHTS, VERDICT_THRESHOLD } from "@/server/scoring/rules";

interface ScoreInput {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface VerdictInput {
  scores: ScoreInput;
  flags: string[];
}

export interface VerdictOutput {
  riskLevel: RiskLevelValue;
  finalScore: number;
  confidence: number;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeVerdict(input: VerdictInput): VerdictOutput {
  const finalScore = clampScore(
    input.scores.a * SCORE_WEIGHTS.a +
      input.scores.b * SCORE_WEIGHTS.b +
      input.scores.c * SCORE_WEIGHTS.c +
      input.scores.d * SCORE_WEIGHTS.d
  );

  if (hasHardRedFlag(input.flags)) {
    return {
      riskLevel: "high_risk",
      finalScore,
      confidence: 90
    };
  }

  if (finalScore >= VERDICT_THRESHOLD.trusted) {
    return { riskLevel: "trusted", finalScore, confidence: 80 };
  }

  if (finalScore >= VERDICT_THRESHOLD.suspicious) {
    return { riskLevel: "suspicious", finalScore, confidence: 75 };
  }

  return { riskLevel: "high_risk", finalScore, confidence: 78 };
}
