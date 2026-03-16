"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Mode = "quick" | "deep";
type Provider = "openai_compatible" | "custom";

interface ApiErrorDetail {
  code: string;
  stage: string;
  reason: string;
  suggestions: string[];
  debug?: {
    timestamp?: string;
    rawMessage?: string;
    upstreamStatus?: number;
    endpoint?: string;
  };
}

export default function EndpointForm() {
  const router = useRouter();
  const [providerType, setProviderType] = React.useState<Provider>("openai_compatible");
  const [baseUrl, setBaseUrl] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [modelClaim, setModelClaim] = React.useState("");
  const [responsePath, setResponsePath] = React.useState("choices.0.message.content");
  const [mode, setMode] = React.useState<Mode>("quick");
  const [error, setError] = React.useState<string>("");
  const [errorDetail, setErrorDetail] = React.useState<ApiErrorDetail | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setErrorDetail(null);

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
          runConfig: { mode }
        })
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string; errorDetail?: ApiErrorDetail };
        setError(body.error ?? "\u521b\u5efa\u68c0\u6d4b\u4efb\u52a1\u5931\u8d25");
        setErrorDetail(body.errorDetail ?? null);
        setLoading(false);
        return;
      }

      const body = (await response.json()) as { runId: string };
      router.push(`/runs/${body.runId}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "\u521b\u5efa\u68c0\u6d4b\u4efb\u52a1\u5931\u8d25");
      setErrorDetail({
        code: "CLIENT_REQUEST_FAILED",
        stage: "runtime",
        reason: "\u63d0\u4ea4\u8bf7\u6c42\u5931\u8d25\uff0c\u53ef\u80fd\u662f\u7f51\u7edc\u4e2d\u65ad\u6216\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528\u3002",
        suggestions: [
          "\u68c0\u67e5\u7f51\u7edc\u540e\u5237\u65b0\u9875\u9762\u91cd\u8bd5\u3002",
          "\u82e5\u6301\u7eed\u5931\u8d25\uff0c\u7a0d\u540e\u518d\u8bd5\u6216\u8054\u7cfb\u7ba1\u7406\u5458\u3002"
        ],
        debug: {
          timestamp: new Date().toISOString(),
          rawMessage: caughtError instanceof Error ? caughtError.message : "unknown client error"
        }
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form-card">
      <label className="field-group">
        <span>{"\u63a5\u53e3\u7c7b\u578b"}</span>
        <select className="field-control" value={providerType} onChange={(event) => setProviderType(event.target.value as Provider)}>
          <option value="openai_compatible">{"OpenAI \u517c\u5bb9"}</option>
          <option value="custom">{"\u81ea\u5b9a\u4e49\u9002\u914d\u5668"}</option>
        </select>
      </label>

      <label className="field-group">
        <span>{"\u63a5\u53e3 Base URL"}</span>
        <input
          className="field-control"
          value={baseUrl}
          onChange={(event) => setBaseUrl(event.target.value)}
          required
          placeholder={providerType === "custom" ? "https://gateway.example.com/chat" : "https://api.provider.com/v1"}
        />
      </label>

      <label className="field-group">
        <span>{"API Key\uff08\u5fc5\u586b\uff09"}</span>
        <input
          className="field-control"
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="sk-..."
          required
        />
      </label>

      <label className="field-group">
        <span>{"\u58f0\u79f0\u6a21\u578b\u540d"}</span>
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
          <span>{"\u81ea\u5b9a\u4e49\u54cd\u5e94\u8def\u5f84"}</span>
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
        <span>{"\u68c0\u6d4b\u6a21\u5f0f"}</span>
        <select className="field-control" value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
          <option value="quick">{"\u5feb\u901f\uff08\u4f4e\u6210\u672c\uff09"}</option>
          <option value="deep">{"\u6df1\u5ea6\uff08\u9ad8\u7f6e\u4fe1\uff09"}</option>
        </select>
      </label>

      <button className="button-primary" type="submit" disabled={loading}>
        {loading ? "\u68c0\u6d4b\u4e2d..." : "\u5f00\u59cb\u68c0\u6d4b"}
      </button>

      <p className="muted-text">{"\u8bf4\u660e\uff1a\u751f\u4ea7\u7248\u4ec5\u5c55\u793a\u5df2\u5b9e\u73b0\u4e14\u53ef\u771f\u5b9e\u8fd0\u884c\u7684\u9002\u914d\u5668\u3002"}</p>

      {error ? (
        <section role="alert" className="field-error-block">
          <p className="field-error">{error}</p>
          {errorDetail ? (
            <>
              <p className="error-reason">{errorDetail.reason}</p>
              <ul className="error-suggestions">
                {errorDetail.suggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <details className="error-debug">
                <summary>{"\u6280\u672f\u8c03\u8bd5\u4fe1\u606f"}</summary>
                <pre>{JSON.stringify(errorDetail, null, 2)}</pre>
              </details>
            </>
          ) : null}
        </section>
      ) : null}
    </form>
  );
}
