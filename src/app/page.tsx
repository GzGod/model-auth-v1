import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Model Integrity Lab</p>
        <h1 className="hero-title">Model Auth</h1>
        <p className="hero-copy">
          Detect API model substitutions with protocol signals, capability probes, and statistical consistency checks.
        </p>
        <div className="hero-actions">
          <Link className="button-primary" href="/config">
            Start Audit
          </Link>
          <a className="button-secondary" href="https://github.com/GzGod/model-auth-v1" target="_blank" rel="noreferrer">
            View Source
          </a>
        </div>
      </header>

      <section className="feature-grid">
        <article className="panel">
          <h2 className="section-title">Protocol Fingerprint</h2>
          <p className="muted-text">
            Detect inconsistent response envelopes, usage patterns, stream chunk behavior, and error signature drift.
          </p>
        </article>
        <article className="panel">
          <h2 className="section-title">Capability Fingerprint</h2>
          <p className="muted-text">
            Compare output quality under controlled probes across reasoning, coding, context retention, and safety.
          </p>
        </article>
        <article className="panel">
          <h2 className="section-title">Evidence Report</h2>
          <p className="muted-text">
            Produce a reproducible verdict package with score breakdown, red flags, and stage-level evidence traces.
          </p>
        </article>
      </section>
    </main>
  );
}
