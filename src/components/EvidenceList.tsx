import React from "react";

interface EvidenceListProps {
  title: string;
  items: string[];
}

export default function EvidenceList({ title, items }: EvidenceListProps) {
  return (
    <section className="panel">
      <h3 className="section-title">{title}</h3>
      {items.length === 0 ? (
        <p className="muted-text">No evidence records.</p>
      ) : (
        <ul className="evidence-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
