import EndpointForm from "@/components/EndpointForm";

export default function ConfigPage() {
  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Endpoint Verifier</p>
        <h1 className="hero-title">Run a model authenticity audit</h1>
        <p className="hero-copy">
          Configure the provider endpoint, submit claimed model metadata, and execute a quick or deep multi-signal
          verification run.
        </p>
      </header>
      <EndpointForm />
    </main>
  );
}
