/** @type {import("@trivago/prettier-plugin-sort-imports").PrettierConfig} */
export default {
	plugins: [
		"@trivago/prettier-plugin-sort-imports",
		"prettier-plugin-tailwindcss",
		"prettier-plugin-packagejson",
	],
	semi: false,
	useTabs: true,

	importOrder: ["<THIRD_PARTY_MODULES>", "^[#/|./]"],
	importOrderSeparation: true,
	importOrderCaseInsensitive: true,
	importOrderGroupNamespaceSpecifiers: true,
}
