
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import type { HomePageReview } from "./components/HomePage";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("The application root element is missing.");

function readInitialReviews(element: HTMLElement): HomePageReview[] | undefined {
  const serialized = element.dataset.initialReviews;
  if (!serialized) return undefined;
  try {
    const value: unknown = JSON.parse(serialized);
    return Array.isArray(value) ? value as HomePageReview[] : undefined;
  } catch {
    return undefined;
  }
}

const app = (
  <App
    initialPathname={window.location.pathname}
    initialReviews={readInitialReviews(root)}
  />
);

if (root.dataset.ssr === "true" && root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
  