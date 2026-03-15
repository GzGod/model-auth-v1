import type { AdapterRequest, AdapterResponse, ProviderAdapter } from "@/server/adapters/base";

export class OpenAICompatibleAdapter implements ProviderAdapter {
  public readonly name = "openai_compatible";
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(input: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = input.baseUrl ?? "";
    this.apiKey = input.apiKey;
  }

  async invoke(input: AdapterRequest): Promise<AdapterResponse> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {})
      },
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens,
        stream: input.stream ?? false,
        ...input.extra
      })
    });

    if (!response.ok) {
      throw new Error(`upstream error: ${response.status}`);
    }

    const raw = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    return {
      content: raw.choices?.[0]?.message?.content ?? "",
      usage: {
        promptTokens: raw.usage?.prompt_tokens,
        completionTokens: raw.usage?.completion_tokens,
        totalTokens: raw.usage?.total_tokens
      },
      raw
    };
  }
}
