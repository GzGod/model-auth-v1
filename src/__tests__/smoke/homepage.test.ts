import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "@/app/page";

describe("homepage", () => {
  it("renders hero and feature keywords", () => {
    const html = renderToStaticMarkup(Home());
    expect(html).toContain("模型鉴真 V1");
    expect(html).toContain("协议指纹");
    expect(html).toContain("能力指纹");
    expect(html).toContain("/config");
  });
});
