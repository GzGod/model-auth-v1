import React from "react";

interface EvidenceListProps {
  title: string;
  items: string[];
  variant: "flag" | "evidence";
}

const FLAG_EXPLANATIONS: Record<string, string> = {
  "a:non_empty_response": "\u63a5\u53e3\u8fd4\u56de\u4e3a\u7a7a\uff0c\u65e0\u6cd5\u8bc1\u660e\u5bf9\u5e94\u6a21\u578b\u53ef\u6b63\u5e38\u5de5\u4f5c\u3002",
  "a:json_envelope": "\u63a5\u53e3\u8fd4\u56de\u7ed3\u6784\u5f02\u5e38\uff0c\u4e0e\u58f0\u79f0\u7684\u6a21\u578b API \u534f\u8bae\u4e0d\u7b26\u3002",
  "a:latency_reasonable": "\u9996\u6b21\u9884\u68c0\u54cd\u5e94\u8fc7\u6162\uff0c\u5b58\u5728\u901a\u9053\u6216\u8c03\u5ea6\u4e0d\u7a33\u5b9a\u98ce\u9669\u3002",
  "a:openai_choices_envelope": "OpenAI \u517c\u5bb9\u63a5\u53e3\u672a\u8fd4\u56de\u6807\u51c6 choices \u7ed3\u6784\uff0c\u5b58\u5728\u5957\u58f3\u6216\u4e2d\u8f6c\u4fee\u6539\u98ce\u9669\u3002",
  "b:reasoning_math:drop": "\u7b80\u5355\u63a8\u7406/\u7b97\u672f\u80fd\u529b\u4f4e\u4e8e\u9884\u671f\uff0c\u53ef\u80fd\u4e0d\u662f\u58f0\u79f0\u7684\u9ad8\u9636\u6a21\u578b\u3002",
  "b:format_json:drop": "\u6307\u5b9a JSON \u683c\u5f0f\u65e0\u6cd5\u7a33\u5b9a\u9075\u5faa\uff0c\u8bf4\u660e\u6307\u4ee4\u9075\u5faa\u80fd\u529b\u4e0b\u964d\u3002",
  "b:context_recall:drop": "\u4e0a\u4e0b\u6587\u8bb0\u5fc6\u5931\u8d25\uff0c\u7b26\u5408\u4f4e\u914d\u6a21\u578b\u6216\u4e2d\u95f4\u5c42\u88c1\u526a\u7684\u7279\u5f81\u3002",
  "b:instruction_following:drop": "\u591a\u6761\u4ef6\u6307\u4ee4\u8ddf\u968f\u80fd\u529b\u4e0d\u8db3\uff0c\u4e0e\u58f0\u79f0\u6a21\u578b\u80fd\u529b\u4e0d\u5339\u914d\u3002",
  "c:distribution_reject": "\u540c\u7c7b\u63d0\u95ee\u7684\u8f93\u51fa\u5206\u5e03\u4e0d\u7a33\u5b9a\uff0c\u7591\u4f3c\u80cc\u540e\u6a21\u578b\u6216\u8def\u7531\u4e0d\u4e00\u81f4\u3002",
  "d:accuracy_volatility": "\u5404\u80fd\u529b\u9879\u5f97\u5206\u6ce2\u52a8\u8fc7\u5927\uff0c\u8f93\u51fa\u8d28\u91cf\u4e0d\u7a33\u5b9a\u3002",
  "d:latency_volatility": "\u54cd\u5e94\u65f6\u5ef6\u6ce2\u52a8\u8fc7\u5927\uff0c\u53ef\u80fd\u5b58\u5728\u591a\u6a21\u578b\u6df7\u8dd1\u6216\u4e0d\u7a33\u5b9a\u8c03\u5ea6\u3002",
  "hard:redflag:met_and_capability_drop": "\u7edf\u8ba1\u5206\u5e03\u5f02\u5e38 + \u80fd\u529b\u660e\u663e\u4e0b\u964d\u540c\u65f6\u51fa\u73b0\uff0c\u5c5e\u4e8e\u9ad8\u5371\u7ec4\u5408\u98ce\u9669\u3002"
};

const DIMENSION_LABELS: Record<string, string> = {
  reasoning_math: "\u7b97\u672f/\u63a8\u7406",
  format_json: "JSON \u683c\u5f0f\u9075\u5faa",
  context_recall: "\u4e0a\u4e0b\u6587\u8bb0\u5fc6",
  instruction_following: "\u6307\u4ee4\u9075\u5faa"
};

function explainFlag(flag: string): string {
  if (FLAG_EXPLANATIONS[flag]) return FLAG_EXPLANATIONS[flag];
  if (flag.startsWith("a:")) return "\u534f\u8bae\u5c42\u4fe1\u53f7\u5f02\u5e38\uff0c\u5efa\u8bae\u590d\u67e5\u63a5\u53e3\u517c\u5bb9\u6027\u3002";
  if (flag.startsWith("b:")) return "\u80fd\u529b\u5c42\u4fe1\u53f7\u5f02\u5e38\uff0c\u8bf4\u660e\u8f93\u51fa\u8d28\u91cf\u4e0e\u58f0\u79f0\u6a21\u578b\u4e0d\u5339\u914d\u3002";
  if (flag.startsWith("c:")) return "\u7edf\u8ba1\u4e00\u81f4\u6027\u5f02\u5e38\uff0c\u53ef\u80fd\u5b58\u5728\u6a21\u578b\u5207\u6362\u6216\u7a33\u5b9a\u6027\u95ee\u9898\u3002";
  if (flag.startsWith("d:")) return "\u6ce2\u52a8\u6027\u6307\u6807\u5f02\u5e38\uff0c\u5efa\u8bae\u8fdb\u4e00\u6b65\u89c2\u5bdf\u65f6\u6bb5\u8868\u73b0\u3002";
  return "\u8fd9\u662f\u7cfb\u7edf\u6355\u6349\u5230\u7684\u5f02\u5e38\u6807\u8bb0\uff0c\u8868\u793a\u8be5\u9879\u68c0\u6d4b\u672a\u8fbe\u5230\u671f\u671b\u3002";
}

function explainEvidence(evidence: string): string {
  if (evidence.startsWith("preflight_sample=")) {
    return "\u9884\u68c0\u8bf7\u6c42\u5df2\u6210\u529f\u8fd4\u56de\uff0c\u8fd9\u662f\u6a21\u578b\u9996\u6b21\u54cd\u5e94\u7684\u622a\u53d6\u6837\u672c\u3002";
  }

  const capabilityMatch = evidence.match(
    /^([a-z_]+):([0-9.]+)\/([0-9.]+)\s+latency_ms=([0-9]+)\s+sample=(.*)$/
  );
  if (capabilityMatch) {
    const dimension = capabilityMatch[1];
    const observed = Number(capabilityMatch[2]);
    const expected = Number(capabilityMatch[3]);
    const latency = Number(capabilityMatch[4]);
    const label = DIMENSION_LABELS[dimension] ?? dimension;
    const result = observed >= expected ? "\u8fbe\u6807" : "\u672a\u8fbe\u6807";
    return `${label}\u68c0\u6d4b${result}\uff1a\u5f97\u5206 ${observed.toFixed(2)} / \u76ee\u6807 ${expected.toFixed(2)}\uff0c\u54cd\u5e94\u8017\u65f6 ${latency}ms\u3002`;
  }

  if (evidence.startsWith("met_reject=")) {
    return evidence.endsWith("true")
      ? "\u5206\u5e03\u68c0\u9a8c\u672a\u901a\u8fc7\uff0c\u8f93\u51fa\u6a21\u5f0f\u4e0e\u671f\u671b\u5206\u5e03\u5b58\u5728\u5dee\u5f02\u3002"
      : "\u5206\u5e03\u68c0\u9a8c\u901a\u8fc7\uff0c\u8f93\u51fa\u6a21\u5f0f\u6574\u4f53\u7a33\u5b9a\u3002";
  }

  if (evidence.startsWith("p_value=")) {
    return "p_value \u7528\u6765\u8868\u793a\u5206\u5e03\u5dee\u5f02\u663e\u8457\u6027\uff1b\u503c\u8d8a\u5c0f\uff0c\u8d8a\u53ef\u80fd\u5b58\u5728\u6a21\u578b\u4e0d\u4e00\u81f4\u3002";
  }

  if (evidence.startsWith("consistency_unique=")) {
    return "\u8fd9\u662f\u91cd\u590d\u63d0\u95ee\u7684\u552f\u4e00\u7ed3\u679c\u6570\uff1b\u503c\u8d8a\u9ad8\uff0c\u4e00\u81f4\u6027\u8d8a\u5dee\u3002";
  }

  if (evidence.startsWith("accuracy_std_dev=")) {
    return "\u5404\u80fd\u529b\u7ef4\u5ea6\u5f97\u5206\u7684\u6807\u51c6\u5dee\uff0c\u503c\u8d8a\u5927\u8868\u793a\u8f93\u51fa\u8d28\u91cf\u6ce2\u52a8\u8d8a\u5927\u3002";
  }

  if (evidence.startsWith("latency_cv=")) {
    return "\u65f6\u5ef6\u53d8\u5f02\u7cfb\u6570\uff08CV\uff09\uff0c\u503c\u8d8a\u9ad8\u8868\u793a\u54cd\u5e94\u901f\u5ea6\u8d8a\u4e0d\u7a33\u5b9a\u3002";
  }

  if (evidence.startsWith("latency_samples=")) {
    return "\u8ba1\u7b97\u65f6\u5ef6\u7a33\u5b9a\u6027\u65f6\u4f7f\u7528\u7684\u91c7\u6837\u6b21\u6570\uff0c\u6837\u672c\u8d8a\u591a\u7ed3\u679c\u8d8a\u53ef\u9760\u3002";
  }

  return "\u8fd9\u662f\u5e95\u5c42\u68c0\u6d4b\u8bb0\u5f55\uff0c\u7528\u4e8e\u652f\u6301\u6700\u7ec8\u5224\u5b9a\u3002";
}

function explainItem(item: string, variant: "flag" | "evidence"): string {
  return variant === "flag" ? explainFlag(item) : explainEvidence(item);
}

export default function EvidenceList({ title, items, variant }: EvidenceListProps) {
  return (
    <section className="panel">
      <h3 className="section-title">{title}</h3>
      {items.length === 0 ? (
        <p className="muted-text">{"\u6682\u65e0\u8bc1\u636e\u8bb0\u5f55\u3002"}</p>
      ) : (
        <ul className="evidence-list">
          {items.map((item) => (
            <li key={item}>
              <p className="evidence-raw">{item}</p>
              <p className="evidence-explain">{explainItem(item, variant)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
