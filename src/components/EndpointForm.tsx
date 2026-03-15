"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Mode = "quick" | "deep";
type Provider = "openai_compatible" | "custom";

export default function EndpointForm() {
  const router = useRouter();
  const [providerType, setProviderType] = React.useState<Provider>("openai_compatible");
  const [baseUrl, setBaseUrl] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [modelClaim, setModelClaim] = React.useState("");
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
          runConfig: { mode }
        })
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "\u521b\u5efa\u68c0\u6d4b\u4efb\u52a1\u5931\u8d25");
      }

      const body = (await response.json()) as { runId: string };
      router.push(`/runs/${body.runId}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "\u521b\u5efa\u68c0\u6d4b\u4efb\u52a1\u5931\u8d25");
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
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
    </form>
  );
}
