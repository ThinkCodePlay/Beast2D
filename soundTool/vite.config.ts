import { defineConfig } from "vite";

// Relative asset paths so the built page also works from a subfolder
// (the sound-tool-live preview branch serves it under /2d/).
export default defineConfig({ base: "./" });
