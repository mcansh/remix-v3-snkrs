import type { Controller } from "@remix-run/fetch-router"

import { routes } from "#src/routes.ts"

export const commonFileHandlers = {
	robotsTxt() {
		return new Response(null, { status: 404 })
	},
	sitemapXml() {
		return new Response(null, { status: 404 })
	},
	faviconIco() {
		return new Response(null, { status: 404 })
	},
} satisfies Controller<typeof routes.commonFiles>
