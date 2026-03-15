import React from "react";

interface ScoreboardProps {
  finalScore: number;
  riskLevel: string;
}

export default function Scoreboard({ finalScore, riskLevel }: ScoreboardProps) {
  const riskLabelMap: Record<string, string> = {
    trusted: "\u53ef\u4fe1",
    suspicious: "\u53ef\u7591",
    high_risk: "\u9ad8\u98ce\u9669",
    inconclusive: "\u5f85\u786e\u8ba4"
  };

  const label = riskLabelMap[riskLevel] ?? riskLevel.replace("_", " ");
  const scoreClass = finalScore >= 80 ? "score-good" : finalScore >= 60 ? "score-mid" : "score-bad";

  return (
    <section className="score-card">
      <h2 className="section-title">{"\u7efc\u5408\u5224\u5b9a"}</h2>
      <p className={`score-value ${scoreClass}`}>{finalScore}</p>
      <p className="badge">{label}</p>
      <div className="score-track" aria-hidden>
        <div className={`score-fill ${scoreClass}`} style={{ width: `${Math.max(0, Math.min(100, finalScore))}%` }} />
      </div>
    </section>
  );
}
