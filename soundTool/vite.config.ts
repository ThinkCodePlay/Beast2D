import { defineConfig } from "vite";

// 2D board build. Relative asset paths so the built page also works from a
// subfolder (the sound-tool-live preview branch serves it under /2d/).
// The 3D build has its own config (vite.config.3d.ts).
export default defineConfig({
  base: "./",
  build: { outDir: "dist/2d" },
});
