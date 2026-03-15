import { z } from "zod";

const customAdapterSchema = z.object({
  responsePath: z.string().min(1),
  promptPath: z.string().optional(),
  modelPath: z.string().optional(),
  headers: z.record(z.string()).optional(),
  staticBody: z.record(z.unknown()).optional()
});

export const endpointConfigSchema = z
  .object({
    providerType: z.enum(["openai_compatible", "anthropic", "gemini", "azure_openai", "custom"]),
    baseUrl: z.string().url(),
    apiKey: z.string().min(1).optional(),
    modelClaim: z.string().min(1),
    adapterMapping: customAdapterSchema.optional()
  })
  .superRefine((value, ctx) => {
    if (value.providerType === "custom" && !value.adapterMapping) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "自定义适配器必须提供 adapterMapping",
        path: ["adapterMapping"]
      });
    }
  });

export type EndpointConfigInput = z.infer<typeof endpointConfigSchema>;
