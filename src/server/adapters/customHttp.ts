import type { AdapterRequest, AdapterResponse, ProviderAdapter } from "@/server/adapters/base";
import { readMappedContent } from "@/server/adapters/customMapping";

interface CustomHttpAdapterInput {
  baseUrl?: string;
  apiKey?: string;
  responsePath: string;
  headers?: Record<string, string>;
  staticBody?: Record<string, unknown>;
}

export class CustomHttpAdapter implements ProviderAdapter {
  public readonly name = "custom";
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly responsePath: string;
  private readonly headers: Record<string, string>;
  private readonly staticBody: Record<string, unknown>;

  constructor(input: CustomHttpAdapterInput) {
    this.baseUrl = input.baseUrl ?? "";
    this.apiKey = input.apiKey;
    this.responsePath = input.responsePath;
    this.headers = input.headers ?? {};
    this.staticBody = input.staticBody ?? {};
  }

  async invoke(input: AdapterRequest): Promise<AdapterResponse> {
    if (!this.baseUrl) {
      throw new Error("custom provider requires baseUrl");
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        ...this.headers
      },
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens,
        stream: input.stream ?? false,
        ...this.staticBody,
        ...input.extra
      })
    });

    if (!response.ok) {
      const rawBody = await response.text();
      const bodySnippet = rawBody.replace(/\s+/g, " ").trim().slice(0, 240);
      throw new Error(
        `upstream error: ${response.status}; endpoint=${this.baseUrl}${bodySnippet ? `; body=${bodySnippet}` : ""}`
      );
    }

    const raw = (await response.json()) as unknown;
    const content = readMappedContent(raw, { responsePath: this.responsePath });
    if (!content.trim()) {
      throw new Error("custom responsePath did not resolve to text content");
    }

    return {
      content,
      raw
    };
  }
}
