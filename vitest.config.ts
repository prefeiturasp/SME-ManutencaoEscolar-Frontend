import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./src/test/server-only.ts"),
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
        "src/components/icons/**",
        "src/components/form/index.ts",
        "src/components/ui/{alert-dialog,badge,button,card,command,input,label,popover,select,sonner,table,toast-custom,tooltip}.tsx",
        "src/**/*.test.{ts,tsx}",
        "src/setupTests.ts",
        "src/test/**",
        "src/**/*.types.ts",
        "src/**/*.type.ts",
        "src/**/*.d.ts",
        "vite.config.ts",
        "eslint.config.js",
      ],
    },
  },
});
