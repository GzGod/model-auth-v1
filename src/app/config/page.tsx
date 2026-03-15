import EndpointForm from "@/components/EndpointForm";

export default function ConfigPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        maxWidth: 860,
        margin: "0 auto",
        display: "grid",
        gap: 16
      }}
    >
      <header>
        <h1 style={{ marginBottom: 8 }}>Model Auth V1</h1>
        <p style={{ margin: 0, color: "#52525b" }}>
          Configure endpoint, claim model, and run quick or deep verification.
        </p>
      </header>
      <EndpointForm />
    </main>
  );
}
