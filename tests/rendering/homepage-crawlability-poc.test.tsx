// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import React, { act } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "../../src/App";
import { render } from "../../src/entry-server";
import type { HomePageReview } from "../../src/components/HomePage";

const publishedReviews: HomePageReview[] = [
  { title: "Published sample reviewer", initials: "PS", description: "Approved review text", rating: 4, isPublished: true },
  { title: "Unpublished sample reviewer", initials: "US", description: "Unpublished private text", rating: 5, isPublished: false },
];

describe("homepage server rendering and hydration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it.each(["/", "/home"])("renders route-aware homepage HTML for %s with published reviews and no unpublished text", (pathname) => {
    const html = render(pathname, publishedReviews);
    expect(html).toContain("Where Beauty Meets Luxury");
    expect(html).toContain("Published sample reviewer");
    expect(html).toContain("Approved review text");
    expect(html).not.toContain("Unpublished sample reviewer");
    expect(html).not.toContain("Unpublished private text");
    expect(html).not.toContain("opacity:0");
  });

  it("keeps the existing hard-coded reviews as fallback when managed reviews are disabled", () => {
    const html = render("/");
    expect(html).toContain("Shauna Haberlin");
    expect(html).toContain("My favourite salon in Dubai!");
  });

  it("does not restore legacy reviews when managed mode has no published reviews", () => {
    const html = render("/", []);
    expect(html).not.toContain("What Our Clients Say");
    expect(html).not.toContain("Reviews will appear here soon.");
    expect(html).not.toContain("Shauna Haberlin");
    expect(html).not.toContain("My favourite salon in Dubai!");
  });

  it("HTML-escapes untrusted review text in initial server-rendered markup", () => {
    const html = render("/", [
      { title: "Sample reviewer", initials: "SR", description: '<script>alert("x")</script>', rating: 5, isPublished: true },
    ]);
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert("x")</script>');
  });

  it("hydrates server-rendered homepage markup without React hydration warnings", async () => {
    const previousPath = window.location.pathname;
    window.history.replaceState({}, "", "/");
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const errors: string[] = [];
    const originalError = console.error;
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    });

    const rootElement = document.createElement("div");
    rootElement.id = "root";
    rootElement.dataset.ssr = "true";
    rootElement.dataset.initialReviews = JSON.stringify(publishedReviews.filter((review) => review.isPublished === true));
    rootElement.innerHTML = render("/", publishedReviews.filter((review) => review.isPublished === true));
    document.body.appendChild(rootElement);

    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(rootElement, <App
          initialPathname={window.location.pathname}
          initialReviews={JSON.parse(rootElement.dataset.initialReviews || "[]") as HomePageReview[]}
          initialSSR={true}
        />);
      });
      expect(rootElement.textContent).toContain("Published sample reviewer");
      expect(rootElement.textContent).not.toContain("Unpublished sample reviewer");
      expect(errors.filter((message) => /hydration|did not match|server HTML/i.test(message))).toEqual([]);
    } finally {
      if (root) await act(async () => root?.unmount());
      window.history.replaceState({}, "", previousPath || "/");
      void originalError;
    }
  });
});
