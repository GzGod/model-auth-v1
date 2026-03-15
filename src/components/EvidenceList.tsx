import React from "react";

interface EvidenceListProps {
  title: string;
  items: string[];
}

export default function EvidenceList({ title, items }: EvidenceListProps) {
  return (
    <section
      style={{
        border: "1px solid #e4e4e7",
        borderRadius: 10,
        padding: 16
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {items.length === 0 ? (
        <p style={{ marginBottom: 0, color: "#71717a" }}>No evidence records.</p>
      ) : (
        <ul style={{ marginBottom: 0 }}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
