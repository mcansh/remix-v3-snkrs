import { remix } from "@jacob-ebey/vite-plugin-remix";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  builder: {
    async buildApp(builder) {
      await builder.build(builder.environments.ssr);
      await builder.build(builder.environments.client);
    },
  },
  environments: {
    client: {
      build: {
        outDir: "dist/client",
        rollupOptions: {
          input: "src/entry.browser",
        },
      },
    },
    ssr: {
      build: {
        outDir: "dist/ssr",
        rollupOptions: {
          input: "src/entry.server",
        },
      },
    },
  },
  plugins: [remix(), devtoolsJson()],
});
