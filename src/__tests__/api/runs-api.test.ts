import { describe, it, expect } from "vitest";
import { POST as createRun } from "@/app/api/runs/route";

describe("runs api", () => {
  it("creates run and returns run id", async () => {
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
    const data = (await response.json()) as { runId: string };

    expect(response.status).toBe(201);
    expect(data.runId).toBeTypeOf("string");
  });
});
