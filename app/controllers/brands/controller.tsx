import type { Controller } from "remix/fetch-router"

import { render } from "#app/lib/html.tsx"
import { requireAuth } from "#app/middleware/auth.ts"
import {
	getAllUserSneakers,
	getBrandBySlug,
	getBrandsForUser,
} from "#app/models/sneaker.ts"
import type { routes } from "#app/routes.ts"
import { getCurrentUser } from "#app/utils/context.ts"

import { BrandsList } from "./list-view.tsx"
import { BrandShowView } from "./show-view.tsx"

export const brandHandlers = {
	middleware: [requireAuth],
	actions: {
		async index() {
			let user = getCurrentUser()
			let brands = await getBrandsForUser(user.id)

			return render(<BrandsList brandCounts={brands} />)
		},

		async show({ params }) {
			let user = getCurrentUser()
			let brandRecord = await getBrandBySlug(params.brand)

			if (brandRecord == null) {
				return render(
					<BrandShowView
						brandLabel={params.brand}
						showcase={{
							sneakers: [],
							total: 0,
						}}
						user={{ username: user.username }}
					/>,
				)
			}

			let sneakers = await getAllUserSneakers(user.id)

			let brandLabel = brandRecord.name

			return render(
				<BrandShowView
					brandLabel={brandLabel}
					showcase={{
						sneakers,
						total: sneakers.length,
					}}
					user={{ username: user.username }}
				/>,
			)
		},
	},
} satisfies Controller<typeof routes.brands>
