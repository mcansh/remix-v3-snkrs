import type { Controller } from "remix/fetch-router"

import { Document } from "#app/components/document.tsx"
import { env } from "#app/env.ts"
import { render } from "#app/lib/html.tsx"
import { routes } from "#app/routes.ts"

export const brandHandlers = {
	middleware: [],
	actions: {
		async index() {
			// TODO: relation between brands and sneakers
			let sneakers = await env.db.query.sneakers.findMany()
			let grouped = Object.groupBy(sneakers, (sneaker) => sneaker.brand)
			let brandCounts = Object.entries(grouped).map(([brand, sneakers]) => ({
				brand,
				count: sneakers?.length ?? 0,
			}))

			return render(
				<Document>
					<div class="container">
						<h1>Brands</h1>
						<ul>
							{brandCounts.map((brand) => (
								<li key={brand.brand}>
									<a href={routes.brands.show.href({ brand: brand.brand })}>
										{brand.brand}{" "}
										<span className="text-sm">({brand.count})</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				</Document>,
			)
		},

		async show({ params }) {
			return render(
				<Document>
					<div class="container">
						<h1>{params.brand}</h1>
					</div>
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.brands>
