import { appendStageResult, createRun, getRunById, updateRun } from "@/server/db";
import type { AdapterRequest, ProviderAdapter } from "@/server/adapters/base";
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

interface TimedInvocation {
  content: string;
  raw: unknown;
  latencyMs: number;
}

interface CapabilityProbeRuntime {
  dimension: string;
  expected: number;
  observed: number;
  latencyMs: number;
  detail: string;
}

function normalizeText(input: string): string {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const variance = values.reduce((acc, value) => acc + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function responseSnippet(text: string, limit = 80): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit)}...`;
}

async function invokeTimed(adapter: ProviderAdapter, input: AdapterRequest): Promise<TimedInvocation> {
  const startedAt = Date.now();
  const response = await adapter.invoke(input);
  return {
    content: response.content,
    raw: response.raw,
    latencyMs: Date.now() - startedAt
  };
}

async function runUpstreamPreflight(adapter: ProviderAdapter, endpointConfig: EndpointConfig): Promise<TimedInvocation> {
  const preflight = await invokeTimed(adapter, {
    model: endpointConfig.modelClaim,
    messages: [{ role: "user", content: "Reply exactly with: PONG" }],
    temperature: 0,
    maxTokens: 16
  });

  if (!preflight.content.trim()) {
    throw new Error("\u4e0a\u6e38\u63a5\u53e3\u8fd4\u56de\u5185\u5bb9\u4e3a\u7a7a\uff0c\u65e0\u6cd5\u5b8c\u6210\u9274\u771f");
  }

  return preflight;
}

async function runProtocolStage(
  adapter: ProviderAdapter,
  endpointConfig: EndpointConfig,
  latencyBucket: number[]
): Promise<Awaited<ReturnType<typeof runStageAProtocol>>> {
  const preflight = await runUpstreamPreflight(adapter, endpointConfig);
  latencyBucket.push(preflight.latencyMs);

  const rawObject = typeof preflight.raw === "object" && preflight.raw !== null;
  const openAIEnvelopeOK =
    endpointConfig.providerType === "openai_compatible"
      ? Array.isArray((preflight.raw as { choices?: unknown[] }).choices)
      : true;

  const probes = [
    {
      name: "non_empty_response",
      passed: preflight.content.trim().length > 0,
      detail: `content_len=${preflight.content.trim().length}`
    },
    {
      name: "json_envelope",
      passed: rawObject,
      detail: `raw_type=${typeof preflight.raw}`
    },
    {
      name: "latency_reasonable",
      passed: preflight.latencyMs < 30000,
      detail: `latency_ms=${preflight.latencyMs}`
    },
    {
      name: "openai_choices_envelope",
      passed: openAIEnvelopeOK,
      detail: endpointConfig.providerType === "openai_compatible" ? `choices_envelope=${String(openAIEnvelopeOK)}` : "skipped"
    }
  ];

  const stage = await runStageAProtocol({ probes });
  stage.evidence.push(`preflight_sample=${responseSnippet(preflight.content)}`);
  return stage;
}

async function runCapabilityStage(
  adapter: ProviderAdapter,
  endpointConfig: EndpointConfig,
  runConfig: RunConfig,
  latencyBucket: number[]
): Promise<Awaited<ReturnType<typeof runStageBCapability>> & { observedScores: number[] }> {
  const probes: CapabilityProbeRuntime[] = [];

  const math = await invokeTimed(adapter, {
    model: endpointConfig.modelClaim,
    messages: [{ role: "user", content: "You must only output one number. Compute: 13 + 29" }],
    temperature: 0,
    maxTokens: 24
  });
  latencyBucket.push(math.latencyMs);
  const mathText = normalizeText(math.content);
  probes.push({
    dimension: "reasoning_math",
    expected: 0.95,
    observed: mathText === "42" ? 1 : mathText.includes("42") ? 0.6 : 0,
    latencyMs: math.latencyMs,
    detail: responseSnippet(math.content)
  });

  const jsonProbe = await invokeTimed(adapter, {
    model: endpointConfig.modelClaim,
    messages: [
      {
        role: "user",
        content: 'Output strict JSON only: {"result":"ok","score":7}'
      }
    ],
    temperature: 0,
    maxTokens: 64
  });
  latencyBucket.push(jsonProbe.latencyMs);
  let jsonObserved = 0;
  try {
    const parsed = JSON.parse(jsonProbe.content) as { result?: string; score?: number };
    jsonObserved = parsed.result === "ok" && parsed.score === 7 ? 1 : 0.5;
  } catch {
    jsonObserved = 0;
  }
  probes.push({
    dimension: "format_json",
    expected: 0.95,
    observed: jsonObserved,
    latencyMs: jsonProbe.latencyMs,
    detail: responseSnippet(jsonProbe.content)
  });

  const contextProbe = await invokeTimed(adapter, {
    model: endpointConfig.modelClaim,
    messages: [
      { role: "user", content: "Remember this token exactly: K9-ALPHA-72. Reply: STORED" },
      { role: "user", content: "Now output only the token you remembered." }
    ],
    temperature: 0,
    maxTokens: 32
  });
  latencyBucket.push(contextProbe.latencyMs);
  const contextText = normalizeText(contextProbe.content);
  probes.push({
    dimension: "context_recall",
    expected: 0.9,
    observed: contextText === "k9-alpha-72" ? 1 : contextText.includes("k9-alpha-72") ? 0.6 : 0,
    latencyMs: contextProbe.latencyMs,
    detail: responseSnippet(contextProbe.content)
  });

  if (runConfig.mode === "deep") {
    const instructionProbe = await invokeTimed(adapter, {
      model: endpointConfig.modelClaim,
      messages: [
        {
          role: "user",
          content: "Reply in two lines. The first line must be exactly ACK-9."
        }
      ],
      temperature: 0,
      maxTokens: 64
    });
    latencyBucket.push(instructionProbe.latencyMs);
    const firstLine = instructionProbe.content.split(/\r?\n/)[0]?.trim() ?? "";
    probes.push({
      dimension: "instruction_following",
      expected: 0.9,
      observed: firstLine === "ACK-9" ? 1 : 0,
      latencyMs: instructionProbe.latencyMs,
      detail: responseSnippet(instructionProbe.content)
    });
  }

  const stage = await runStageBCapability({
    probes: probes.map((probe) => ({ dimension: probe.dimension, expected: probe.expected, observed: probe.observed }))
  });

  stage.evidence = probes.map(
    (probe) => `${probe.dimension}:${probe.observed.toFixed(2)}/${probe.expected.toFixed(2)} latency_ms=${probe.latencyMs} sample=${probe.detail}`
  );

  return {
    ...stage,
    observedScores: probes.map((probe) => probe.observed * 100)
  };
}

async function runConsistencyStage(
  adapter: ProviderAdapter,
  endpointConfig: EndpointConfig,
  runConfig: RunConfig,
  latencyBucket: number[]
): Promise<Awaited<ReturnType<typeof runStageCMet>> & { uniqueCount: number }> {
  const rounds = runConfig.mode === "deep" ? 4 : 2;
  const outputs: string[] = [];

  for (let index = 0; index < rounds; index += 1) {
    const sample = await invokeTimed(adapter, {
      model: endpointConfig.modelClaim,
      messages: [{ role: "user", content: "Output only this token: CONST-514" }],
      temperature: 0,
      maxTokens: 16
    });
    latencyBucket.push(sample.latencyMs);
    outputs.push(normalizeText(sample.content));
  }

  const uniqueCount = new Set(outputs).size;
  const reject = uniqueCount > 1;
  const pValue = reject ? Math.max(0.01, 1 / rounds) : 0.95;

  const stage = await runStageCMet({ reject, pValue });
  stage.evidence.push(`consistency_unique=${uniqueCount}/${rounds}`);
  return {
    ...stage,
    uniqueCount
  };
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
    const adapter = createAdapter({
      providerType: input.endpointConfig.providerType,
      baseUrl: input.endpointConfig.baseUrl,
      apiKey: input.endpointConfig.apiKey,
      modelClaim: input.endpointConfig.modelClaim,
      adapterMapping: input.endpointConfig.adapterMapping
    });

    const allLatencies: number[] = [];

    const stageA = await runProtocolStage(adapter, input.endpointConfig, allLatencies);
    appendStageResult(runId, stageA.stage, stageA.score, stageA.flags, stageA.evidence);

    const stageB = await runCapabilityStage(adapter, input.endpointConfig, input.runConfig, allLatencies);
    appendStageResult(runId, stageB.stage, stageB.score, stageB.flags, stageB.evidence);

    const stageC = await runConsistencyStage(adapter, input.endpointConfig, input.runConfig, allLatencies);
    appendStageResult(runId, stageC.stage, stageC.score, stageC.flags, stageC.evidence);

    const latencyAverage = mean(allLatencies);
    const latencyCv = latencyAverage > 0 ? stdDev(allLatencies) / latencyAverage : 0;
    const accuracyStdDev = stdDev(stageB.observedScores);

    const stageD = await runStageDVolatility({
      accuracyStdDev,
      latencyCv
    });
    stageD.evidence.push(`latency_samples=${allLatencies.length}`);
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
    const message = error instanceof Error ? error.message : "\u4e0a\u6e38\u63a5\u53e3\u9884\u68c0\u5931\u8d25";
    throw new Error(`\u68c0\u6d4b\u5931\u8d25\uff1a${message}`);
  }
}
