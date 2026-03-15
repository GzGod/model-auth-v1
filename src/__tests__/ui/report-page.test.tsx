// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Scoreboard from "@/components/Scoreboard";

describe("scoreboard", () => {
  it("renders final score and risk level", () => {
    render(<Scoreboard finalScore={78} riskLevel="suspicious" />);
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText("suspicious")).toBeInTheDocument();
  });
});
