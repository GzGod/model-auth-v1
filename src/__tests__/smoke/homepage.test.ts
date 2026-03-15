import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "@/app/page";

describe("homepage", () => {
  it("renders hero and feature keywords", () => {
    const html = renderToStaticMarkup(Home());
    expect(html).toContain("Model Auth");
    expect(html).toContain("Protocol Fingerprint");
    expect(html).toContain("Capability Fingerprint");
    expect(html).toContain("/config");
  });
});
