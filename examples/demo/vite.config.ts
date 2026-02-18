import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@editorjs-mentions/plugin": path.resolve(
        __dirname,
        "../../packages/editorjs-mentions/src/index.ts"
      )
    }
  }
});

