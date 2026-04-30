import { cloudflare } from "@cloudflare/vite-plugin"
import { remix } from "@mcansh/vite-plugin-remix"
import { svgSprite } from "@mcansh/vite-plugin-svg-sprite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import devtoolsJson from "vite-plugin-devtools-json"

export default defineConfig({
	plugins: [
		remix({ serverHandler: false }),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		devtoolsJson(),
		tailwindcss(),
		svgSprite(),
	],
})
