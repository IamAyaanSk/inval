import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "node",
    alias: {
      "server-only": path.resolve(__dirname, "./src/lib/__mocks__/server-only.ts"),
    },
  },
});
