import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  root: resolve(__dirname, "src/demo"),
  resolve: {
    alias: {
      "@mukhindev/request": resolve(__dirname, "src/lib"),
    },
  },
});
