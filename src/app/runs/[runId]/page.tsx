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
          <h1 className="section-title">{"\u672a\u627e\u5230\u68c0\u6d4b\u8bb0\u5f55"}</h1>
          <p className="muted-text">{"\u68c0\u6d4b ID\uff1a"}{runId}</p>
        </section>
      </main>
    );
  }

  const allEvidence = run.stageResults.flatMap((stage) => stage.evidence);
  const allFlags = run.stageResults.flatMap((stage) => stage.flags);

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">{"\u68c0\u6d4b\u62a5\u544a"}</p>
        <h1 className="hero-title">{"\u4efb\u52a1 "}{run.id.slice(0, 8)}</h1>
        <p className="hero-copy">
          {"\u58f0\u79f0\u6a21\u578b "}<code>{run.modelClaim}</code>
          {" \u00b7 \u6e20\u9053 "}<code>{run.providerType}</code>
          {" \u00b7 \u72b6\u6001 "}<code>{run.status}</code>
        </p>
      </header>

      <Scoreboard finalScore={run.finalScore ?? 0} riskLevel={run.riskLevel ?? "inconclusive"} />
      <EvidenceList title={"\u98ce\u9669\u6807\u8bb0"} items={allFlags} />
      <EvidenceList title={"\u8bc1\u636e\u660e\u7ec6"} items={allEvidence} />
    </main>
  );
}
