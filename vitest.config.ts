import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Reuse application aliases and plugins so feasibility tests match the app build.

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ["tests/admin/**/*.test.tsx", "tests/rendering/**/*.test.tsx"],
      environment: "jsdom",
      setupFiles: ["./tests/setup-dom.ts"],
      restoreMocks: true,
    },
  }),
);
