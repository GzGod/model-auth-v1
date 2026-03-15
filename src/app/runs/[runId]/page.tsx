import EvidenceList from "@/components/EvidenceList";
import Scoreboard from "@/components/Scoreboard";
import { getRunById } from "@/server/db";

export default async function RunReportPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = getRunById(runId);

  if (!run) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Run Not Found</h1>
        <p>Run ID: {runId}</p>
      </main>
    );
  }

  const allEvidence = run.stageResults.flatMap((stage) => stage.evidence);
  const allFlags = run.stageResults.flatMap((stage) => stage.flags);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        maxWidth: 920,
        margin: "0 auto",
        display: "grid",
        gap: 16
      }}
    >
      <header>
        <h1 style={{ marginBottom: 4 }}>Audit Report</h1>
        <p style={{ margin: 0, color: "#52525b" }}>
          Run <code>{run.id}</code> • Model <code>{run.modelClaim}</code> • Status <code>{run.status}</code>
        </p>
      </header>

      <Scoreboard finalScore={run.finalScore ?? 0} riskLevel={run.riskLevel ?? "inconclusive"} />
      <EvidenceList title="Flags" items={allFlags} />
      <EvidenceList title="Evidence" items={allEvidence} />
    </main>
  );
}
