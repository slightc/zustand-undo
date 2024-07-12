import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src"],
  outDir: "lib",
  format: ["esm", "cjs"],
  bundle: false,
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
});
