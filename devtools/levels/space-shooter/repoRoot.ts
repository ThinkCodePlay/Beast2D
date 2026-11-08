import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Repository root (three levels up from this folder). */
export const REPO_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
