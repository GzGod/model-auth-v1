export interface NormalizedMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AdapterRequest {
  model: string;
  messages: NormalizedMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  extra?: Record<string, unknown>;
}

export interface AdapterResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  raw: unknown;
}

export interface ProviderAdapter {
  name: string;
  invoke(input: AdapterRequest): Promise<AdapterResponse>;
}

export interface AdapterFactoryInput {
  providerType: "openai_compatible" | "anthropic" | "gemini" | "azure_openai" | "custom";
  baseUrl?: string;
  apiKey?: string;
  modelClaim?: string;
  adapterMapping?: Record<string, unknown>;
}
