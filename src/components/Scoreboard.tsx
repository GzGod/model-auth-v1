import React from "react";

interface ScoreboardProps {
  finalScore: number;
  riskLevel: string;
}

export default function Scoreboard({ finalScore, riskLevel }: ScoreboardProps) {
  const label = riskLevel.replace("_", " ");
  const scoreClass = finalScore >= 80 ? "score-good" : finalScore >= 60 ? "score-mid" : "score-bad";
  return (
    <section className="score-card">
      <h2 className="section-title">Verdict</h2>
      <p className={`score-value ${scoreClass}`}>{finalScore}</p>
      <p className="badge">{label}</p>
      <div className="score-track" aria-hidden>
        <div className={`score-fill ${scoreClass}`} style={{ width: `${Math.max(0, Math.min(100, finalScore))}%` }} />
      </div>
    </section>
  );
}
