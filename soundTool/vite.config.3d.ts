import { defineConfig } from "vite";

// 3D board build, same relative-asset layout as the 2D build (vite.config.ts),
// served under /3d/ on the sound-tool-live preview branch.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist/3d",
    rollupOptions: { input: { index: "3d.html" } },
  },
});
