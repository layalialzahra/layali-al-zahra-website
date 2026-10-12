import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import type { HomePageReview } from "./components/HomePage";

export function render(pathname: string, reviews?: HomePageReview[]): string {
  return renderToString(<App initialPathname={pathname} initialReviews={reviews} initialSSR={true} />);
}
