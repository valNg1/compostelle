/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Business rules and persistence are tested as pure functions; shared UI
    // components are asserted via react-dom/server static markup — both run in
    // Node, so no DOM environment is required.
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
