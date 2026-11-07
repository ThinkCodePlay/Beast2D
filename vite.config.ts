import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(repoRoot, "index.html"),
        spaceShooterCapture: resolve(
          repoRoot,
          "src/game/Space Shooter/space-shooter-capture.html",
        ),
      },
    },
  },
});
