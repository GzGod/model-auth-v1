"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Mode = "quick" | "deep";
type Provider = "openai_compatible" | "anthropic" | "gemini" | "azure_openai" | "custom";

export default function EndpointForm() {
  const router = useRouter();
  const [providerType, setProviderType] = React.useState<Provider>("openai_compatible");
  const [baseUrl, setBaseUrl] = React.useState("https://example.com/v1");
  const [modelClaim, setModelClaim] = React.useState("gpt-5");
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
            modelClaim
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
      style={{
        display: "grid",
        gap: 12,
        border: "1px solid #e4e4e7",
        borderRadius: 12,
        padding: 20,
        background: "#fafafa"
      }}
    >
      <label>
        Provider
        <select value={providerType} onChange={(event) => setProviderType(event.target.value as Provider)}>
          <option value="openai_compatible">OpenAI Compatible</option>
          <option value="anthropic">Anthropic</option>
          <option value="gemini">Gemini</option>
          <option value="azure_openai">Azure OpenAI</option>
          <option value="custom">Custom</option>
        </select>
      </label>

      <label>
        Base URL
        <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} required />
      </label>

      <label>
        Claimed model
        <input value={modelClaim} onChange={(event) => setModelClaim(event.target.value)} required />
      </label>

      <label>
        Mode
        <select value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
          <option value="quick">Quick</option>
          <option value="deep">Deep</option>
        </select>
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Running..." : "Start Audit"}
      </button>

      {error ? (
        <p role="alert" style={{ margin: 0, color: "#991b1b" }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
