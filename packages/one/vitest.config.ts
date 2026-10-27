import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { vaulTestPlugin } from "./scripts/portable-modules.mjs";

export default defineConfig({
  plugins: [vaulTestPlugin()],
  resolve: {
    alias: {
      "@sirdab/one/foundation": fileURLToPath(
        new URL("./src/foundation/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "scripts/tests/**"],
  },
});
