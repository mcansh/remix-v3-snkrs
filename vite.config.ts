import { cloudflare } from "@cloudflare/vite-plugin";
import { remix } from "@jacob-ebey/vite-plugin-remix";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: "src/entry.browser",
        },
      },
    },
  },
  plugins: [
    remix({ serverHandler: false }),
    cloudflare({
      viteEnvironment: { name: "ssr" },
    }),
    devtoolsJson(),
  ],
});
