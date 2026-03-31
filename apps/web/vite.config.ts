import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("/node_modules/three/")) {
            return "three-core";
          }

          if (id.includes("@react-three/fiber")) {
            return "r3f-core";
          }

          return undefined;
        }
      }
    }
  }
});