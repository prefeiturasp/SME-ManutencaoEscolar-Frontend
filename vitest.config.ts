import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/setupTests.ts',
        '**/*.d.ts',
        'vite.config.ts',
        'eslint.config.js',
      ],
      thresholds: {
        lines: 81,
        statements: 81,
        branches: 81,
        functions: 81,
      },
    },
  },
});
