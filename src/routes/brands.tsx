import { eq } from "drizzle-orm"
import type { Controller } from "remix/fetch-router"

import { Document } from "#src/components/document.tsx"
import { SneakerGrid } from "#src/components/sneaker-grid.tsx"
import { env } from "#src/lib/env.ts"
import { render } from "#src/lib/html.tsx"
import { serializeSneaker } from "#src/models/sneaker.ts"
import { routes } from "#src/routes.ts"
import { schema } from "../db"

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
			let sneakers = await env.db.query.sneakers
				.findMany({
					where: eq(schema.sneakers.brand, params.brand),
				})
				.then((sneakers) => {
					return sneakers.map((s) => serializeSneaker(s))
				})

			return render(
				<Document>
					<div class="container">
						<h1>{params.brand}</h1>
						<SneakerGrid sneakers={sneakers} />
					</div>
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.brands>
