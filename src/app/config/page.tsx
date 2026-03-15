import EndpointForm from "@/components/EndpointForm";

export default function ConfigPage() {
  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">端点检测配置</p>
        <h1 className="hero-title">发起模型真实性检测</h1>
        <p className="hero-copy">
          填写服务商接口与声称模型信息，选择快速或深度模式后执行多信号交叉验证。
        </p>
      </header>
      <EndpointForm />
    </main>
  );
}
