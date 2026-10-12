import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/admin/**/*.test.tsx"],
    environment: "jsdom",
    setupFiles: ["./tests/setup-dom.ts"],
    restoreMocks: true,
  },
});
