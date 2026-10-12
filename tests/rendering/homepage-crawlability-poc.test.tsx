import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "../../src/components/HomePage";

describe("homepage server-rendering feasibility spike", () => {
  it("renders the existing homepage and fallback review text to HTML", () => {
    const html = renderToString(<HomePage onNavigate={() => {}} />);

    expect(html).toContain("What Our Clients Say");
    expect(html).toContain("Shauna Haberlin");
    expect(html).toContain("My favourite salon in Dubai!");
  });

  it("renders only published review items supplied to the server-rendered component", () => {
    const html = renderToString(
      <HomePage
        onNavigate={() => {}}
        reviews={[
          { title: "Published sample reviewer", initials: "PS", description: "Approved review text", isPublished: true },
          { title: "Unpublished sample reviewer", initials: "US", description: "Unpublished private text", isPublished: false },
        ]}
      />,
    );

    expect(html).toContain("Published sample reviewer");
    expect(html).toContain("Approved review text");
    expect(html).not.toContain("Unpublished sample reviewer");
    expect(html).not.toContain("Unpublished private text");
  });
});
