import fs from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const cartScriptPath = resolve(repoRoot, "src/game/carts/hello.script.ts");
const MAX_CART_SAVE_BYTES = 256 * 1024;

function beast2dCartSavePlugin(): Plugin {
  return {
    name: "beast2d-cart-save",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url === "/__beast2d/dev" && req.method === "GET") {
          res.statusCode = 200;
          res.end("ok");
          return;
        }
        if (url === "/__beast2d/save-cart" && req.method === "POST") {
          let body = "";
          let tooLarge = false;
          req.on("data", (chunk: string | Buffer) => {
            if (tooLarge) return;
            body += chunk;
            if (Buffer.byteLength(body, "utf8") > MAX_CART_SAVE_BYTES) {
              tooLarge = true;
              res.statusCode = 413;
              res.end("payload too large");
              req.destroy();
            }
          });
          req.on("end", () => {
            if (tooLarge) return;
            try {
              const parsed = JSON.parse(body) as { source?: string };
              if (typeof parsed.source !== "string") {
                res.statusCode = 400;
                res.end("bad request");
                return;
              }
              fs.writeFileSync(cartScriptPath, parsed.source, "utf8");
              res.statusCode = 200;
              res.end("ok");
            } catch {
              res.statusCode = 400;
              res.end("bad request");
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [beast2dCartSavePlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(repoRoot, "index.html"),
      },
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json"],
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
      all: true,
    },
  },
});
