import { z } from "zod";
import { createAndRun } from "@/server/orchestrator/runPipeline";
import { endpointConfigSchema } from "@/server/validation/endpointConfig";

const runConfigSchema = z.object({
  mode: z.enum(["quick", "deep"]),
  maxBudgetTokens: z.number().int().positive().optional(),
  targetFamily: z.string().optional(),
  languageMix: z.enum(["zh_en", "en", "zh"]).optional()
});

const createRunSchema = z.object({
  endpointConfig: endpointConfigSchema,
  runConfig: runConfigSchema
});

type ErrorStage = "validation" | "adapter" | "protocol" | "capability" | "consistency" | "volatility" | "runtime";

interface ErrorDetail {
  code: string;
  stage: ErrorStage;
  reason: string;
  suggestions: string[];
  debug: {
    timestamp: string;
    rawMessage: string;
    upstreamStatus?: number;
    endpoint?: string;
  };
}

interface ApiErrorPayload {
  status: number;
  error: string;
  errorDetail: ErrorDetail;
}

const STAGE_LABELS: Record<ErrorStage, string> = {
  validation: "参数校验",
  adapter: "适配器初始化",
  protocol: "协议预检",
  capability: "能力探针",
  consistency: "一致性检验",
  volatility: "波动性评估",
  runtime: "运行时"
};

function extractStage(input: string): { stage: ErrorStage; detailMessage: string } {
  const match = input.match(/^\[([a-z_]+)\]\s*(.*)$/i);
  if (!match) {
    return { stage: "runtime", detailMessage: input };
  }

  const rawStage = match[1].toLowerCase();
  const detailMessage = match[2] || input;
  const stage =
    rawStage === "adapter" ||
    rawStage === "protocol" ||
    rawStage === "capability" ||
    rawStage === "consistency" ||
    rawStage === "volatility" ||
    rawStage === "runtime"
      ? (rawStage as ErrorStage)
      : "runtime";

  return { stage, detailMessage };
}

function extractUpstreamStatus(input: string): number | undefined {
  const match = input.match(/upstream error:\s*(\d{3})/i);
  return match ? Number(match[1]) : undefined;
}

function extractEndpoint(input: string): string | undefined {
  const match = input.match(/endpoint=([^;\s]+)/i);
  return match?.[1];
}

function buildValidationError(error: z.ZodError): ApiErrorPayload {
  const issue = error.issues[0];
  const path = issue?.path.join(".") || "unknown";
  const message = issue?.message ?? "请求参数不合法";

  return {
    status: 400,
    error: message,
    errorDetail: {
      code: "INVALID_PAYLOAD",
      stage: "validation",
      reason: `请求参数字段 ${path} 不合法。`,
      suggestions: [
        "检查 Base URL、API Key、模型名是否填写完整。",
        "确认检测模式是否为 quick 或 deep。",
        "若使用自定义适配器，确认 responsePath 可正确取到文本内容。"
      ],
      debug: {
        timestamp: new Date().toISOString(),
        rawMessage: message
      }
    }
  };
}

function buildRuntimeError(errorMessage: string): ApiErrorPayload {
  const { stage, detailMessage } = extractStage(errorMessage);
  const upstreamStatus = extractUpstreamStatus(detailMessage);
  const endpoint = extractEndpoint(detailMessage);

  let status = 500;
  let code = "DETECTION_INTERNAL_ERROR";
  let reason = detailMessage;
  let suggestions = ["稍后重试一次。", "若问题持续，请把调试信息发给管理员排查。"];

  if (detailMessage.includes("暂未在生产版开放")) {
    status = 400;
    code = "PROVIDER_NOT_ENABLED";
    reason = "当前生产版未开放该接口类型。";
    suggestions = ["切换到 OpenAI 兼容接口。", "或者使用已配置好 responsePath 的自定义适配器。"];
  } else if (detailMessage.includes("custom responsePath did not resolve to text content")) {
    status = 400;
    code = "CUSTOM_MAPPING_INVALID";
    reason = "自定义响应路径未取到文本内容，无法完成检测。";
    suggestions = [
      "检查 responsePath 是否指向真实文本字段。",
      "先用 Postman/curl 查看上游返回 JSON，再按实际结构填写 responsePath。"
    ];
  } else if (detailMessage.includes("upstream non-json response")) {
    status = 502;
    code = "UPSTREAM_NON_JSON_RESPONSE";
    reason = "上游返回的不是 JSON，通常是 HTML 错误页或网关拦截页。";
    suggestions = [
      "OpenAI 兼容接口请确认 Base URL 为类似 https://xxx/v1（不要只填域名根路径）。",
      "检查是否被 WAF/Cloudflare 返回了网页挑战页。",
      "用 curl 直连同一 URL，确认返回 content-type 为 application/json。"
    ];
  } else if (upstreamStatus !== undefined) {
    status = 502;
    code = `UPSTREAM_HTTP_${upstreamStatus}`;

    if (upstreamStatus === 401 || upstreamStatus === 403) {
      reason = "上游鉴权失败，API Key 无效或没有该模型权限。";
      suggestions = [
        "检查 API Key 是否正确。",
        "确认该 Key 在上游是否开通了你填写的模型。",
        "确认 Base URL 与 Key 属于同一服务商环境。"
      ];
    } else if (upstreamStatus === 404) {
      reason = "上游未找到接口或模型。";
      suggestions = [
        "检查 Base URL 是否正确（是否包含 /v1）。",
        "检查模型名是否存在于该服务商。",
        "确认中转站是否真的代理了该模型。"
      ];
    } else if (upstreamStatus === 429) {
      reason = "上游触发限流或额度不足。";
      suggestions = [
        "稍等后重试。",
        "检查账号余额、QPS 限额和并发限制。",
        "降低调用频率后再测。"
      ];
    } else if ([500, 502, 503, 504].includes(upstreamStatus)) {
      reason = `上游服务暂时不可用（${upstreamStatus}）。`;
      suggestions = [
        "这通常是上游拥塞或故障，稍后重试。",
        "可切换同站点其他模型做对照。",
        "若持续出现，基本可判定是服务商或中转站路由问题。"
      ];
    } else {
      reason = `上游返回异常状态码 ${upstreamStatus}。`;
      suggestions = ["检查上游返回体中的错误信息。", "确认模型、权限和参数是否匹配该服务商规范。"];
    }
  } else if (
    detailMessage.includes("fetch failed") ||
    detailMessage.includes("ENOTFOUND") ||
    detailMessage.includes("ECONNREFUSED") ||
    detailMessage.includes("ETIMEDOUT") ||
    detailMessage.includes("network")
  ) {
    status = 502;
    code = "UPSTREAM_NETWORK_ERROR";
    reason = "无法连接上游接口，网络或域名不可达。";
    suggestions = [
      "检查 Base URL 是否能在公网访问。",
      "确认服务商没有按 IP 或地域拦截。",
      "确认目标域名证书和 TLS 配置正常。"
    ];
  }

  const stageLabel = STAGE_LABELS[stage] ?? STAGE_LABELS.runtime;

  return {
    status,
    error: `检测失败（${stageLabel}）：${reason}`,
    errorDetail: {
      code,
      stage,
      reason,
      suggestions,
      debug: {
        timestamp: new Date().toISOString(),
        rawMessage: detailMessage,
        upstreamStatus,
        endpoint
      }
    }
  };
}

function normalizeError(error: unknown): ApiErrorPayload {
  if (error instanceof z.ZodError) {
    return buildValidationError(error);
  }

  if (error instanceof Error) {
    return buildRuntimeError(error.message);
  }

  return {
    status: 500,
    error: "检测失败：未知错误",
    errorDetail: {
      code: "UNKNOWN_ERROR",
      stage: "runtime",
      reason: "服务端返回了未知错误。",
      suggestions: ["稍后重试。", "若持续出现，请联系管理员。"],
      debug: {
        timestamp: new Date().toISOString(),
        rawMessage: String(error)
      }
    }
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = createRunSchema.parse(body);
    const result = await createAndRun(parsed);
    return Response.json(result, { status: 201 });
  } catch (error) {
    const normalized = normalizeError(error);
    console.error("[api/runs][POST] failed", {
      status: normalized.status,
      error: normalized.error,
      detail: normalized.errorDetail
    });
    return Response.json(
      {
        error: normalized.error,
        errorDetail: normalized.errorDetail
      },
      { status: normalized.status }
    );
  }
}
