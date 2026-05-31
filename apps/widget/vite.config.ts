import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/widget.ts",
      name: "ReceptioWidget",
      fileName: "receptio-widget"
    }
  }
});
