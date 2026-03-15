"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Mode = "quick" | "deep";
type Provider = "openai_compatible" | "anthropic" | "gemini" | "azure_openai" | "custom";

export default function EndpointForm() {
  const router = useRouter();
  const [providerType, setProviderType] = React.useState<Provider>("openai_compatible");
  const [baseUrl, setBaseUrl] = React.useState("https://example.com/v1");
  const [apiKey, setApiKey] = React.useState("");
  const [modelClaim, setModelClaim] = React.useState("gpt-5");
  const [responsePath, setResponsePath] = React.useState("choices.0.message.content");
  const [mode, setMode] = React.useState<Mode>("quick");
  const [error, setError] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          endpointConfig: {
            providerType,
            baseUrl,
            apiKey: apiKey.trim() || undefined,
            modelClaim,
            ...(providerType === "custom" ? { adapterMapping: { responsePath } } : {})
          },
          runConfig: {
            mode
          }
        })
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "创建检测任务失败");
      }

      const body = (await response.json()) as { runId: string };
      router.push(`/runs/${body.runId}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "创建检测任务失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="form-card"
    >
      <label className="field-group">
        <span>接口类型</span>
        <select
          className="field-control"
          value={providerType}
          onChange={(event) => setProviderType(event.target.value as Provider)}
        >
          <option value="openai_compatible">OpenAI 兼容</option>
          <option value="anthropic">Anthropic</option>
          <option value="gemini">Gemini</option>
          <option value="azure_openai">Azure OpenAI</option>
          <option value="custom">自定义适配器</option>
        </select>
      </label>

      <label className="field-group">
        <span>接口 Base URL</span>
        <input
          className="field-control"
          value={baseUrl}
          onChange={(event) => setBaseUrl(event.target.value)}
          required
          placeholder="https://api.example.com/v1"
        />
      </label>

      <label className="field-group">
        <span>API Key（可选）</span>
        <input
          className="field-control"
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="sk-..."
        />
      </label>

      <label className="field-group">
        <span>声称模型名</span>
        <input
          className="field-control"
          value={modelClaim}
          onChange={(event) => setModelClaim(event.target.value)}
          required
          placeholder="gpt-5"
        />
      </label>

      {providerType === "custom" ? (
        <label className="field-group">
          <span>自定义响应路径</span>
          <input
            className="field-control"
            value={responsePath}
            onChange={(event) => setResponsePath(event.target.value)}
            required
            placeholder="choices.0.message.content"
          />
        </label>
      ) : null}

      <label className="field-group">
        <span>检测模式</span>
        <select className="field-control" value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
          <option value="quick">快速（低成本）</option>
          <option value="deep">深度（高置信）</option>
        </select>
      </label>

      <button className="button-primary" type="submit" disabled={loading}>
        {loading ? "检测中..." : "开始检测"}
      </button>

      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
    </form>
  );
}
