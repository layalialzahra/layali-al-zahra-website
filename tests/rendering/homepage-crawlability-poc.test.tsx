import { describe, expect, it } from "vitest";
import { render } from "../../src/entry-server";

describe("homepage server-rendering feasibility", () => {
  it("renders route-aware homepage HTML with published review text and omits unpublished reviews", () => {
    const html = render("/", [
      { title: "Published sample reviewer", initials: "PS", description: "Approved review text", rating: 4, isPublished: true },
      { title: "Unpublished sample reviewer", initials: "US", description: "Unpublished private text", rating: 5, isPublished: false },
    ]);

    expect(html).toContain("Where Beauty Meets Luxury");
    expect(html).toContain("Published sample reviewer");
    expect(html).toContain("Approved review text");
    expect(html).not.toContain("Unpublished sample reviewer");
    expect(html).not.toContain("Unpublished private text");
  });

  it("keeps the existing hard-coded reviews as the fallback when managed reviews are disabled", () => {
    const html = render("/");
    expect(html).toContain("Shauna Haberlin");
    expect(html).toContain("My favourite salon in Dubai!");
  });

  it("does not restore legacy reviews when managed mode explicitly has no published reviews", () => {
    const html = render("/", []);
    expect(html).not.toContain("What Our Clients Say");
    expect(html).not.toContain("Reviews will appear here soon.");
    expect(html).not.toContain("Shauna Haberlin");
    expect(html).not.toContain("My favourite salon in Dubai!");
  });

  it("HTML-escapes untrusted review text in the initial server-rendered markup", () => {
    const html = render("/", [
      { title: "Sample reviewer", initials: "SR", description: '<script>alert("x")</script>', rating: 5, isPublished: true },
    ]);
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain('<script>alert("x")</script>');
  });

});