import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import devtoolsJson from "vite-plugin-devtools-json"
import { remix } from "./vite-plugin-remix"

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
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		devtoolsJson(),
		tailwindcss(),
	],
})
