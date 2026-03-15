import { describe, it, expect } from "vitest";
import { POST as createRun } from "@/app/api/runs/route";
import { GET as getRun } from "@/app/api/runs/[runId]/route";

describe("runs api", () => {
  it("rejects invalid payload with 400", async () => {
    const request = new Request("http://localhost/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ foo: "bar" })
    });

    const response = await createRun(request);
    expect(response.status).toBe(400);
  });

  it("creates run and returns verdict summary", async () => {
    const request = new Request("http://localhost/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        endpointConfig: {
          providerType: "openai_compatible",
          baseUrl: "https://example.com/v1",
          modelClaim: "gpt-5"
        },
        runConfig: { mode: "quick" }
      })
    });

    const response = await createRun(request);
    const data = (await response.json()) as { runId: string; status: string; riskLevel: string; finalScore: number };

    expect(response.status).toBe(201);
    expect(data.runId).toBeTypeOf("string");
    expect(data.status).toBe("completed");
    expect(data.riskLevel).toBeTypeOf("string");
    expect(data.finalScore).toBeGreaterThan(0);

    const getResponse = await getRun(new Request(`http://localhost/api/runs/${data.runId}`), {
      params: Promise.resolve({ runId: data.runId })
    });
    const run = (await getResponse.json()) as { stageResults: unknown[]; status: string };

    expect(getResponse.status).toBe(200);
    expect(run.status).toBe("completed");
    expect(run.stageResults).toHaveLength(4);
  });
});
