import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">模型真实性实验室</p>
        <h1 className="hero-title">模型鉴真 V1</h1>
        <p className="hero-copy">
          通过协议指纹、能力探针和统计一致性校验，识别 API 是否存在模型降配、套壳或偷换。
        </p>
        <div className="hero-actions">
          <Link className="button-primary" href="/config">
            开始检测
          </Link>
          <a className="button-secondary" href="https://github.com/GzGod/model-auth-v1" target="_blank" rel="noreferrer">
            查看源码
          </a>
        </div>
      </header>

      <section className="feature-grid">
        <article className="panel">
          <h2 className="section-title">协议指纹</h2>
          <p className="muted-text">
            检测响应结构、计费字段、流式分块行为与报错特征是否稳定且匹配目标模型族。
          </p>
        </article>
        <article className="panel">
          <h2 className="section-title">能力指纹</h2>
          <p className="muted-text">
            通过受控任务对比推理、代码、上下文保持与安全表现，识别能力断层与版本错配。
          </p>
        </article>
        <article className="panel">
          <h2 className="section-title">证据报告</h2>
          <p className="muted-text">
            输出可复核结论包，包含分数构成、风险标记与各阶段证据轨迹，便于复查和留档。
          </p>
        </article>
      </section>
    </main>
  );
}
