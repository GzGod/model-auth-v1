import { getRunById } from "@/server/db";

export async function GET(_request: Request, context: { params: Promise<{ runId: string }> }): Promise<Response> {
  const { runId } = await context.params;
  const run = getRunById(runId);
  if (!run) {
    return Response.json({ error: "未找到检测记录" }, { status: 404 });
  }
  return Response.json(run, { status: 200 });
}
