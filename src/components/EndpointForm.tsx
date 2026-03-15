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
        throw new Error(body.error ?? "failed to create run");
      }

      const body = (await response.json()) as { runId: string };
      router.push(`/runs/${body.runId}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "failed to create run");
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
        <span>Provider</span>
        <select
          className="field-control"
          value={providerType}
          onChange={(event) => setProviderType(event.target.value as Provider)}
        >
          <option value="openai_compatible">OpenAI Compatible</option>
          <option value="anthropic">Anthropic</option>
          <option value="gemini">Gemini</option>
          <option value="azure_openai">Azure OpenAI</option>
          <option value="custom">Custom</option>
        </select>
      </label>

      <label className="field-group">
        <span>Base URL</span>
        <input
          className="field-control"
          value={baseUrl}
          onChange={(event) => setBaseUrl(event.target.value)}
          required
          placeholder="https://api.example.com/v1"
        />
      </label>

      <label className="field-group">
        <span>API Key</span>
        <input
          className="field-control"
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="sk-..."
        />
      </label>

      <label className="field-group">
        <span>Claimed Model</span>
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
          <span>Custom Response Path</span>
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
        <span>Mode</span>
        <select className="field-control" value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
          <option value="quick">Quick</option>
          <option value="deep">Deep</option>
        </select>
      </label>

      <button className="button-primary" type="submit" disabled={loading}>
        {loading ? "Running..." : "Start Audit"}
      </button>

      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
    </form>
  );
}
