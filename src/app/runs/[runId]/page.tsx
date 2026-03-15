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
          <h1 className="section-title">未找到检测记录</h1>
          <p className="muted-text">检测 ID：{runId}</p>
        </section>
      </main>
    );
  }

  const allEvidence = run.stageResults.flatMap((stage) => stage.evidence);
  const allFlags = run.stageResults.flatMap((stage) => stage.flags);

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">检测报告</p>
        <h1 className="hero-title">任务 {run.id.slice(0, 8)}</h1>
        <p className="hero-copy">
          声称模型 <code>{run.modelClaim}</code> · 渠道 <code>{run.providerType}</code> · 状态 <code>{run.status}</code>
        </p>
      </header>

      <Scoreboard finalScore={run.finalScore ?? 0} riskLevel={run.riskLevel ?? "inconclusive"} />
      <EvidenceList title="风险标记" items={allFlags} />
      <EvidenceList title="证据明细" items={allEvidence} />
    </main>
  );
}
