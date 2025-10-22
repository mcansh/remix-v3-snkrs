import type { Config } from "prettier"

export default {
	plugins: [
		"prettier-plugin-organize-imports",
		"prettier-plugin-tailwindcss",
		"prettier-plugin-packagejson",
	],
	semi: false,
	useTabs: true,
} satisfies Config
