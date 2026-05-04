import { asc, eq, sql } from "drizzle-orm"
import type { Controller } from "remix/fetch-router"

import { schema } from "#app/db/index.ts"
import { env } from "#app/env.ts"
import { render } from "#app/lib/html.tsx"
import { requireAuth } from "#app/middleware/auth.ts"
import { getBrandBySlug, getSneakersForShowcase } from "#app/models/sneaker.ts"
import type { routes } from "#app/routes.ts"
import { getCurrentUser } from "#app/utils/context.ts"

import { BrandsList } from "./list-view.tsx"
import { BrandShowView } from "./show-view.tsx"

export const brandHandlers = {
	middleware: [requireAuth],
	actions: {
		async index() {
			let user = getCurrentUser()
			let brandCounts = await env.db
				.select({
					brand: schema.brands.name,
					slug: schema.brands.slug,
					count: sql<number>`count(*)`,
				})
				.from(schema.sneakers)
				.innerJoin(schema.brands, eq(schema.sneakers.brand_id, schema.brands.id))
				.where(eq(schema.sneakers.user_id, user.id))
				.groupBy(schema.brands.id, schema.brands.name, schema.brands.slug)
				.orderBy(asc(schema.brands.name))

			return render(<BrandsList brandCounts={brandCounts} />)
		},

		async show({ params }) {
			let user = getCurrentUser()
			let brandRecord = await getBrandBySlug(params.brand)

			if (!brandRecord) {
				return render(
					<BrandShowView
						brandLabel={params.brand}
						showcase={{
							sneakers: [],
							total: 0,
							page: 1,
							perPage: 24,
							totalPages: 0,
						}}
						user={{ username: user.username }}
					/>,
				)
			}

			let showcase = await getSneakersForShowcase(user.id, {
				status: "all",
				brand: brandRecord.slug,
				sort: "desc",
				page: 1,
				perPage: 24,
			})

			let brandLabel = brandRecord.name

			return render(
				<BrandShowView
					brandLabel={brandLabel}
					showcase={showcase}
					user={{ username: user.username }}
				/>,
			)
		},
	},
} satisfies Controller<typeof routes.brands>
