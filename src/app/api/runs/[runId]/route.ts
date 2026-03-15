import { getRunById } from "@/server/db";

export async function GET(_request: Request, context: { params: Promise<{ runId: string }> }): Promise<Response> {
  const { runId } = await context.params;
  const run = getRunById(runId);
  if (!run) {
    return Response.json({ error: "\u672a\u627e\u5230\u68c0\u6d4b\u8bb0\u5f55" }, { status: 404 });
  }
  return Response.json(run, { status: 200 });
}
