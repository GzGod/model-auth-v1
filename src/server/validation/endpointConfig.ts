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
    try {
      if (/(^|\.)example\.com$/i.test(new URL(value.baseUrl).hostname)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "baseUrl \u4e0d\u80fd\u4f7f\u7528\u793a\u4f8b\u5730\u5740\uff0c\u8bf7\u586b\u5199\u771f\u5b9e\u63a5\u53e3\u5730\u5740",
          path: ["baseUrl"]
        });
      }
    } catch {
      // baseUrl format issues are handled by z.string().url()
    }

    if (value.providerType === "custom" && !value.adapterMapping) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "\u81ea\u5b9a\u4e49\u9002\u914d\u5668\u5fc5\u987b\u63d0\u4f9b adapterMapping",
        path: ["adapterMapping"]
      });
    }
  });

export type EndpointConfigInput = z.infer<typeof endpointConfigSchema>;
