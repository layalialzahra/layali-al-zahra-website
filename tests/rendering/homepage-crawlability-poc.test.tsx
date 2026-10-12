import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "../../src/components/HomePage";

describe("homepage server-rendering feasibility spike", () => {
  it("renders meaningful homepage and review text to HTML without browser effects", () => {
    const html = renderToString(<HomePage onNavigate={() => {}} />);

    expect(html).toContain("What Our Clients Say");
    expect(html).toContain("Shauna Haberlin");
    expect(html).toContain("My favourite salon in Dubai!");
  });
});
