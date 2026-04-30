import type { RemixTestConfig } from "remix/test"

export default {
	glob: {
		test: "**/*.test{,.browser}.tsx",
		browser: "**/*.test.browser.tsx",
	},
	setup: "./test/setup.ts",
	playwrightConfig: {
		projects: [
			{
				name: "chromium",
				use: { browserName: "chromium" },
			},
		],
		use: {
			navigationTimeout: 5_000,
			actionTimeout: 5_000,
		},
	},
} satisfies RemixTestConfig
