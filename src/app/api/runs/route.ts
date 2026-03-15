import { z } from "zod";
import { createAndRun } from "@/server/orchestrator/runPipeline";
import { endpointConfigSchema } from "@/server/validation/endpointConfig";

const runConfigSchema = z.object({
  mode: z.enum(["quick", "deep"]),
  maxBudgetTokens: z.number().int().positive().optional(),
  targetFamily: z.string().optional(),
  languageMix: z.enum(["zh_en", "en", "zh"]).optional()
});

const createRunSchema = z.object({
  endpointConfig: endpointConfigSchema,
  runConfig: runConfigSchema
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = createRunSchema.parse(body);
    const result = await createAndRun(parsed);
    return Response.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? "请求参数不合法" : error instanceof Error ? error.message : "请求参数不合法";
    return Response.json({ error: message }, { status: 400 });
  }
}
