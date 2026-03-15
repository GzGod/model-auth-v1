import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>Model Auth</h1>
      <p style={{ margin: 0, color: "#52525b" }}>Audit claimed model identity for API endpoints.</p>
      <p style={{ margin: 0 }}>
        <Link href="/config">Start a verification run</Link>
      </p>
    </main>
  );
}
