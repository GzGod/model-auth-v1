import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "@/app/page";

describe("homepage", () => {
  it("renders app title", () => {
    const html = renderToStaticMarkup(Home());
    expect(html).toContain("Model Auth");
  });
});
