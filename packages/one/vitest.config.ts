import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({resolve:{alias:{"@sirdab/one/foundation":fileURLToPath(new URL("./src/foundation/index.ts",import.meta.url))}},test:{environment:"jsdom",setupFiles:["./tests/setup.ts"]}});
