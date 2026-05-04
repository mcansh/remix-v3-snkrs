import { eq } from "drizzle-orm"
import type { Controller } from "remix/fetch-router"

import { schema } from "#app/db/index.ts"
import { env } from "#app/env.ts"
import { render } from "#app/lib/html.tsx"
import { requireAuth } from "#app/middleware/auth.ts"
import { getSneakersForShowcase } from "#app/models/sneaker.ts"
import type { routes } from "#app/routes.ts"
import { getCurrentUser } from "#app/utils/context.ts"

import { renderBrandShowView, renderBrandsIndexView } from "./brands-view.tsx"

export const brandHandlers = {
	middleware: [requireAuth],
	actions: {
		async index() {
			let user = getCurrentUser()
			let sneakers = await env.db.query.sneakers.findMany({
				where: eq(schema.sneakers.user_id, user.id),
			})
			let grouped = Object.groupBy(sneakers, (sneaker) => sneaker.brand)
			let brandCounts = Object.entries(grouped)
				.map(([brand, sneakers]) => ({
					brand,
					count: sneakers?.length ?? 0,
					slug: brand.trim().toLowerCase().replace(/\s+/g, "-"),
				}))
				.toSorted((a, b) => {
					return (
						b.brand.length - a.brand.length || a.brand.localeCompare(b.brand)
					)
				})

			return render(renderBrandsIndexView({ brandCounts }))
		},

		async show({ params }) {
			let user = getCurrentUser()
			let showcase = await getSneakersForShowcase(user.id, {
				status: "all",
				brand: params.brand,
				sort: "desc",
				page: 1,
				perPage: 24,
			})

			let brandLabel = showcase.sneakers.at(0)?.brand ?? params.brand

			return render(
				renderBrandShowView({
					brandLabel,
					showcase,
					user: { username: user.username },
				}),
			)
		},
	},
} satisfies Controller<typeof routes.brands>
