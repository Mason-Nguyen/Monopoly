import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react-router") || id.includes("@remix-run")) {
            return "router";
          }

          if (id.includes("@tanstack/react-query") || id.includes("zustand")) {
            return "state";
          }

          if (id.includes("colyseus")) {
            return "colyseus";
          }

          if (id.includes("react") || id.includes("scheduler")) {
            return "react-vendor";
          }

          return "vendor";
        }
      }
    }
  }
});