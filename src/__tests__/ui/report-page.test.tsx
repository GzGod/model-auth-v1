// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Scoreboard from "@/components/Scoreboard";
import EndpointForm from "@/components/EndpointForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe("ui", () => {
  it("renders final score and risk level", () => {
    render(<Scoreboard finalScore={78} riskLevel="suspicious" />);
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText(/suspicious/i)).toBeInTheDocument();
  });

  it("renders endpoint form with api key and start button", () => {
    render(<EndpointForm />);
    expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Audit/i })).toBeInTheDocument();
  });
});
