import type { RemixTestConfig } from "remix/test"

export default {
	glob: {
		test: "**/*.test{,.browser,.e2e}.tsx",
		browser: "**/*.test.browser.tsx",
		e2e: "**/*.test.e2e.tsx",
	},
	setup: "./test/setup.ts",
	playwrightConfig: {
		fullyParallel: true,
		failOnFlakyTests: true,
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
