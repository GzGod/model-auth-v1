import EvidenceList from "@/components/EvidenceList";
import Scoreboard from "@/components/Scoreboard";
import { getRunById } from "@/server/db";

export default async function RunReportPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = getRunById(runId);

  if (!run) {
    return (
      <main className="page-shell">
        <section className="panel">
          <h1 className="section-title">Run Not Found</h1>
          <p className="muted-text">Run ID: {runId}</p>
        </section>
      </main>
    );
  }

  const allEvidence = run.stageResults.flatMap((stage) => stage.evidence);
  const allFlags = run.stageResults.flatMap((stage) => stage.flags);

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Audit Report</p>
        <h1 className="hero-title">Run {run.id.slice(0, 8)}</h1>
        <p className="hero-copy">
          Model <code>{run.modelClaim}</code> · Provider <code>{run.providerType}</code> · Status <code>{run.status}</code>
        </p>
      </header>

      <Scoreboard finalScore={run.finalScore ?? 0} riskLevel={run.riskLevel ?? "inconclusive"} />
      <EvidenceList title="Flags" items={allFlags} />
      <EvidenceList title="Evidence" items={allEvidence} />
    </main>
  );
}
