import type { AdapterFactoryInput, AdapterRequest, AdapterResponse, ProviderAdapter } from "@/server/adapters/base";
import { CustomHttpAdapter } from "@/server/adapters/customHttp";
import { OpenAICompatibleAdapter } from "@/server/adapters/openaiCompatible";

class UnsupportedAdapter implements ProviderAdapter {
  public readonly name: string;
  private readonly message: string;

  constructor(name: string, message: string) {
    this.name = name;
    this.message = message;
  }

  async invoke(_input: AdapterRequest): Promise<AdapterResponse> {
    throw new Error(this.message);
  }
}

export function createAdapter(input: AdapterFactoryInput): ProviderAdapter {
  switch (input.providerType) {
    case "openai_compatible":
      return new OpenAICompatibleAdapter({ baseUrl: input.baseUrl, apiKey: input.apiKey });
    case "anthropic":
      return new UnsupportedAdapter("anthropic", "anthropic 通道暂未在生产版开放");
    case "gemini":
      return new UnsupportedAdapter("gemini", "gemini 通道暂未在生产版开放");
    case "azure_openai":
      return new UnsupportedAdapter("azure_openai", "azure_openai 通道暂未在生产版开放");
    case "custom": {
      const responsePath = typeof input.adapterMapping?.responsePath === "string" ? input.adapterMapping.responsePath : "";
      const headers =
        input.adapterMapping && typeof input.adapterMapping.headers === "object" && input.adapterMapping.headers !== null
          ? (input.adapterMapping.headers as Record<string, string>)
          : undefined;
      const staticBody =
        input.adapterMapping && typeof input.adapterMapping.staticBody === "object" && input.adapterMapping.staticBody !== null
          ? (input.adapterMapping.staticBody as Record<string, unknown>)
          : undefined;
      if (!responsePath) {
        throw new Error("custom provider requires adapterMapping.responsePath");
      }
      return new CustomHttpAdapter({
        baseUrl: input.baseUrl,
        apiKey: input.apiKey,
        responsePath,
        headers,
        staticBody
      });
    }
    default:
      throw new Error("unsupported provider");
  }
}
