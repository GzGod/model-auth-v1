import type { AdapterFactoryInput, AdapterRequest, AdapterResponse, ProviderAdapter } from "@/server/adapters/base";
import { OpenAICompatibleAdapter } from "@/server/adapters/openaiCompatible";

class PlaceholderAdapter implements ProviderAdapter {
  public readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  async invoke(_input: AdapterRequest): Promise<AdapterResponse> {
    throw new Error(`${this.name} adapter is not implemented yet`);
  }
}

export function createAdapter(input: AdapterFactoryInput): ProviderAdapter {
  switch (input.providerType) {
    case "openai_compatible":
      return new OpenAICompatibleAdapter({ baseUrl: input.baseUrl, apiKey: input.apiKey });
    case "anthropic":
      return new PlaceholderAdapter("anthropic");
    case "gemini":
      return new PlaceholderAdapter("gemini");
    case "azure_openai":
      return new PlaceholderAdapter("azure_openai");
    case "custom":
      return new PlaceholderAdapter("custom");
    default:
      throw new Error("unsupported provider");
  }
}
