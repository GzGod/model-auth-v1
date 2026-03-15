import React from "react";

interface ScoreboardProps {
  finalScore: number;
  riskLevel: string;
}

export default function Scoreboard({ finalScore, riskLevel }: ScoreboardProps) {
  const label = riskLevel.replace("_", " ");
  return (
    <section
      style={{
        border: "1px solid #d4d4d8",
        borderRadius: 10,
        padding: 16,
        display: "grid",
        gap: 8
      }}
    >
      <h2 style={{ margin: 0, fontSize: 18 }}>Verdict</h2>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>{finalScore}</p>
      <p style={{ margin: 0, color: "#3f3f46", textTransform: "capitalize" }}>{label}</p>
    </section>
  );
}
