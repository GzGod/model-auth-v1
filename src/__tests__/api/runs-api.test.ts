import { describe, it, expect, vi } from "vitest";
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

  it("rejects placeholder base url", async () => {
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
    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toContain("baseUrl");
  });

  it("returns detailed upstream reason for 503", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("service unavailable", {
        status: 503,
        headers: { "content-type": "text/plain" }
      })
    );

    const request = new Request("http://localhost/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        endpointConfig: {
          providerType: "openai_compatible",
          baseUrl: "https://api.real-provider.test/v1",
          modelClaim: "gpt-5",
          apiKey: "sk-test"
        },
        runConfig: { mode: "quick" }
      })
    });

    const response = await createRun(request);
    const data = (await response.json()) as {
      error: string;
      errorDetail: { code: string; reason: string; suggestions: string[]; debug: { upstreamStatus?: number } };
    };

    expect(response.status).toBe(502);
    expect(data.error).toContain("503");
    expect(data.errorDetail.code).toBe("UPSTREAM_HTTP_503");
    expect(data.errorDetail.reason).toContain("上游服务暂时不可用");
    expect(data.errorDetail.suggestions.length).toBeGreaterThan(0);
    expect(data.errorDetail.debug.upstreamStatus).toBe(503);
    fetchMock.mockRestore();
  });

  it("returns readable reason when upstream returns html", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<html><title>Gateway</title></html>", {
        status: 200,
        headers: { "content-type": "text/html" }
      })
    );

    const request = new Request("http://localhost/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        endpointConfig: {
          providerType: "openai_compatible",
          baseUrl: "https://api.real-provider.test/v1",
          modelClaim: "gpt-5",
          apiKey: "sk-test"
        },
        runConfig: { mode: "quick" }
      })
    });

    const response = await createRun(request);
    const data = (await response.json()) as {
      error: string;
      errorDetail: { code: string; reason: string; suggestions: string[] };
    };

    expect(response.status).toBe(502);
    expect(data.errorDetail.code).toBe("UPSTREAM_NON_JSON_RESPONSE");
    expect(data.errorDetail.reason).toContain("不是 JSON");
    expect(data.errorDetail.suggestions.join(" ")).toContain("/v1");
    fetchMock.mockRestore();
  });

  it("creates run and returns verdict summary", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "PONG" } }],
          usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 }
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" }
        }
      );
    });

    const request = new Request("http://localhost/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        endpointConfig: {
          providerType: "openai_compatible",
          baseUrl: "https://api.real-provider.test/v1",
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
    fetchMock.mockRestore();
  });
});
