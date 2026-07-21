import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      exclude: [
        "src/components/ui/**",
        "src/**/*.test.{ts,tsx}",
        "src/setupTests.ts",
        "src/**/*.types.ts",
        "src/**/*.type.ts",
        "src/**/*.d.ts",
        "vite.config.ts",
        "eslint.config.js",
      ],
    },
  },
});
