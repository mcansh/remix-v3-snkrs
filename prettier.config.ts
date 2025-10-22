import type { Config } from "prettier"

export default {
	plugins: [
		"@trivago/prettier-plugin-sort-imports",
		"prettier-plugin-tailwindcss",
		"prettier-plugin-packagejson",
	],
	semi: false,
	useTabs: true,

	importOrder: ["<THIRD_PARTY_MODULES>", "^[./]"],
	importOrderSeparation: true,
} satisfies Config
