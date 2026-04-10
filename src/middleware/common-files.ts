import type { Middleware } from "@remix-run/fetch-router"

const COMMON_FILES = new Set(["/robots.txt", "/sitemap.xml", "/favicon.ico"])

/**
 * Middleware that returns a 404 for common static file requests
 * (e.g. robots.txt, sitemap.xml, favicon.ico) without performing
 * any user lookup or session work.
 */
export function commonFiles(): Middleware {
	return ({ url }) => {
		if (COMMON_FILES.has(url.pathname)) {
			return new Response(null, { status: 404 })
		}
	}
}
