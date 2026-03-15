import EndpointForm from "@/components/EndpointForm";

export default function ConfigPage() {
  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">{"\u7aef\u70b9\u68c0\u6d4b\u914d\u7f6e"}</p>
        <h1 className="hero-title">{"\u53d1\u8d77\u6a21\u578b\u771f\u5b9e\u6027\u68c0\u6d4b"}</h1>
        <p className="hero-copy">
          {
            "\u586b\u5199\u670d\u52a1\u5546\u63a5\u53e3\u4e0e\u58f0\u79f0\u6a21\u578b\u4fe1\u606f\uff0c\u9009\u62e9\u5feb\u901f\u6216\u6df1\u5ea6\u6a21\u5f0f\u540e\u6267\u884c\u591a\u4fe1\u53f7\u4ea4\u53c9\u9a8c\u8bc1\u3002"
          }
        </p>
      </header>
      <EndpointForm />
    </main>
  );
}
