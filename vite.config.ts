import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { ollamaEnsurePlugin } from "./vite-plugin-ollama-ensure";

export default defineConfig({
  plugins: [tsconfigPaths(), vue(), tailwindcss(), ollamaEnsurePlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Avoid browser CORS when talking to the local Ollama daemon.
      "/ollama-api": {
        target: "http://127.0.0.1:11434",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama-api/, ""),
      },
    },
  },
  preview: {
    proxy: {
      "/ollama-api": {
        target: "http://127.0.0.1:11434",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama-api/, ""),
      },
    },
  },
});
