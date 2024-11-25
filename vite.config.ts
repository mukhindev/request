import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(() => {
  return {
    build: {
      lib: {
        name: "Request",
        entry: "src/index.ts",
        fileName: "index",
      },
    },
    plugins: [dts()],
  };
});
