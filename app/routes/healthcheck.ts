import type { routes } from "#app/routes.js"
import type { BuildAction } from "@remix-run/fetch-router"

import { db, schema } from "#app/db/index.js"

export const healthcheckHandlers = {
	middleware: [],
	async action({ request }) {
		const host = request.headers.get("X-Forwarded-Host") ?? request.headers.get("host")

		try {
			await Promise.all([
				db.select().from(schema.users),
				fetch(`${new URL(request.url).protocol}${host}`, {
					method: "HEAD",
					headers: { "x-healthcheck": "true" },
				}).then((r) => {
					if (!r.ok) return Promise.reject(r)
				}),
			])

			return new Response("OK")
		} catch (error: unknown) {
			console.error(request.url, "healthcheck ❌", { error })
			return new Response("ERROR", { status: 500 })
		}
	},
} satisfies BuildAction<"GET", typeof routes.healthcheck>
