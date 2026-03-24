// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteImagemin from "vite-plugin-imagemin";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    viteImagemin({
      webp: {
        quality: 75,       // 75% calidad, reduce ~70-80% el peso
        method: 6,
      },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 75 },
      svgo: {
        plugins: [{ name: "removeViewBox" }, { name: "removeEmptyAttrs", active: false }],
      },
    }),].filter(Boolean),

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
        inlineManifest: true,
      },
    },
    chunkSizeWarningLimit: 500,
  },


  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
}));
