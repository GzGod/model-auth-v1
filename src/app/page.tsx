import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">{"\u6a21\u578b\u771f\u5b9e\u6027\u5b9e\u9a8c\u5ba4"}</p>
        <h1 className="hero-title">{"\u6a21\u578b\u9274\u771f V1"}</h1>
        <p className="hero-copy">
          {
            "\u901a\u8fc7\u534f\u8bae\u6307\u7eb9\u3001\u80fd\u529b\u63a2\u9488\u548c\u7edf\u8ba1\u4e00\u81f4\u6027\u6821\u9a8c\uff0c\u8bc6\u522b API \u662f\u5426\u5b58\u5728\u6a21\u578b\u964d\u914d\u3001\u5957\u58f3\u6216\u5077\u6362\u3002"
          }
        </p>
        <div className="hero-actions">
          <Link className="button-primary" href="/config">
            {"\u5f00\u59cb\u68c0\u6d4b"}
          </Link>
          <a className="button-secondary" href="https://github.com/GzGod/model-auth-v1" target="_blank" rel="noreferrer">
            {"\u67e5\u770b\u6e90\u7801"}
          </a>
        </div>
      </header>

      <section className="feature-grid">
        <article className="panel">
          <h2 className="section-title">{"\u534f\u8bae\u6307\u7eb9"}</h2>
          <p className="muted-text">
            {
              "\u68c0\u6d4b\u54cd\u5e94\u7ed3\u6784\u3001\u8ba1\u8d39\u5b57\u6bb5\u3001\u6d41\u5f0f\u5206\u5757\u884c\u4e3a\u4e0e\u62a5\u9519\u7279\u5f81\u662f\u5426\u7a33\u5b9a\u4e14\u5339\u914d\u76ee\u6807\u6a21\u578b\u65cf\u3002"
            }
          </p>
        </article>
        <article className="panel">
          <h2 className="section-title">{"\u80fd\u529b\u6307\u7eb9"}</h2>
          <p className="muted-text">
            {
              "\u901a\u8fc7\u53d7\u63a7\u4efb\u52a1\u5bf9\u6bd4\u63a8\u7406\u3001\u4ee3\u7801\u3001\u4e0a\u4e0b\u6587\u4fdd\u6301\u4e0e\u5b89\u5168\u8868\u73b0\uff0c\u8bc6\u522b\u80fd\u529b\u65ad\u5c42\u4e0e\u7248\u672c\u9519\u914d\u3002"
            }
          </p>
        </article>
        <article className="panel">
          <h2 className="section-title">{"\u8bc1\u636e\u62a5\u544a"}</h2>
          <p className="muted-text">
            {
              "\u8f93\u51fa\u53ef\u590d\u6838\u7ed3\u8bba\u5305\uff0c\u5305\u542b\u5206\u6570\u6784\u6210\u3001\u98ce\u9669\u6807\u8bb0\u4e0e\u5404\u9636\u6bb5\u8bc1\u636e\u8f68\u8ff9\uff0c\u4fbf\u4e8e\u590d\u67e5\u548c\u7559\u6863\u3002"
            }
          </p>
        </article>
      </section>
    </main>
  );
}
