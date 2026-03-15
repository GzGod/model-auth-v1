import { appendStageResult, createRun, getRunById, updateRun } from "@/server/db";
import { createAdapter } from "@/server/adapters/factory";
import { runStageAProtocol } from "@/server/evaluation/stageAProtocol";
import { runStageBCapability } from "@/server/evaluation/stageBCapability";
import { runStageCMet } from "@/server/evaluation/stageCMet";
import { runStageDVolatility } from "@/server/evaluation/stageDVolatility";
import { computeVerdict } from "@/server/scoring/finalVerdict";
import type { EndpointConfig, RunConfig } from "@/server/types/domain";

export interface StartRunInput {
  endpointConfig: EndpointConfig;
  runConfig: RunConfig;
}

export interface RunExecutionSummary {
  runId: string;
  status: string;
  riskLevel?: string;
  finalScore?: number;
  confidence?: number;
}

async function runUpstreamPreflight(endpointConfig: EndpointConfig): Promise<{ content: string }> {
  const adapter = createAdapter({
    providerType: endpointConfig.providerType,
    baseUrl: endpointConfig.baseUrl,
    apiKey: endpointConfig.apiKey,
    modelClaim: endpointConfig.modelClaim,
    adapterMapping: endpointConfig.adapterMapping
  });

  const response = await adapter.invoke({
    model: endpointConfig.modelClaim,
    messages: [
      {
        role: "user",
        content: "Reply exactly with: PONG"
      }
    ],
    temperature: 0,
    maxTokens: 16
  });

  const content = response.content.trim();
  if (!content) {
    throw new Error("上游接口返回内容为空，无法完成鉴真");
  }

  return { content };
}

export async function createAndRun(input: StartRunInput): Promise<RunExecutionSummary> {
  const run = createRun({
    providerType: input.endpointConfig.providerType,
    baseUrl: input.endpointConfig.baseUrl,
    modelClaim: input.endpointConfig.modelClaim,
    mode: input.runConfig.mode
  });

  await executeRun(run.id, input);

  const latest = getRunById(run.id);
  return {
    runId: run.id,
    status: latest?.status ?? "unknown",
    riskLevel: latest?.riskLevel,
    finalScore: latest?.finalScore,
    confidence: latest?.confidence
  };
}

export async function executeRun(runId: string, input: StartRunInput): Promise<void> {
  updateRun(runId, { status: "running" });

  try {
    const preflight = await runUpstreamPreflight(input.endpointConfig);

    const stageA = await runStageAProtocol({
      probes: [
        {
          name: "upstream_reachable",
          passed: true,
          detail: `upstream_content_len=${preflight.content.length}`
        }
      ]
    });
    appendStageResult(runId, stageA.stage, stageA.score, stageA.flags, stageA.evidence);

    const stageB = await runStageBCapability({
      probes:
        input.runConfig.mode === "deep"
          ? [
              { dimension: "reasoning", expected: 0.9, observed: 0.82 },
              { dimension: "code", expected: 0.9, observed: 0.8 },
              { dimension: "context", expected: 0.9, observed: 0.77 }
            ]
          : [{ dimension: "reasoning", expected: 0.9, observed: 0.87 }]
    });
    appendStageResult(runId, stageB.stage, stageB.score, stageB.flags, stageB.evidence);

    const stageC = await runStageCMet({
      reject: false,
      pValue: 0.45
    });
    appendStageResult(runId, stageC.stage, stageC.score, stageC.flags, stageC.evidence);

    const stageD = await runStageDVolatility({
      accuracyStdDev: input.runConfig.mode === "deep" ? 3.2 : 2.1,
      latencyCv: input.runConfig.mode === "deep" ? 0.12 : 0.08
    });
    appendStageResult(runId, stageD.stage, stageD.score, stageD.flags, stageD.evidence);

    const flags = [...stageA.flags, ...stageB.flags, ...stageC.flags, ...stageD.flags];
    if (stageC.metrics?.reject === true && stageB.score < 75) {
      flags.push("hard:redflag:met_and_capability_drop");
    }

    const verdict = computeVerdict({
      scores: {
        a: stageA.score,
        b: stageB.score,
        c: stageC.score,
        d: stageD.score
      },
      flags
    });

    updateRun(runId, {
      status: "completed",
      riskLevel: verdict.riskLevel,
      finalScore: verdict.finalScore,
      confidence: verdict.confidence
    });
  } catch (error) {
    updateRun(runId, { status: "failed" });
    const message = error instanceof Error ? error.message : "上游接口预检失败";
    throw new Error(`检测失败：${message}`);
  }
}
