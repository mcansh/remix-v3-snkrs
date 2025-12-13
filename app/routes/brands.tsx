import type { Controller } from "@remix-run/fetch-router"
import { eq } from "drizzle-orm"

import { SneakerGrid } from "#app/components/sneaker-grid.js"
import { renderDocument } from "#app/lib/html.js"
import { serializeSneaker } from "#app/models/sneaker.js"
import { routes } from "#app/routes.js"
import { db, schema } from "../db/index.js"

export const brandHandlers = {
	middleware: [],
	actions: {
		async index() {
			// TODO: relation between brands and sneakers
			let sneakers = await db.query.sneakers.findMany()
			let grouped = Object.groupBy(sneakers, (sneaker) => sneaker.brand)
			let brandCounts = Object.entries(grouped).map(([brand, sneakers]) => ({
				brand,
				count: sneakers?.length ?? 0,
			}))

			return renderDocument(
				<div class="container">
					<h1>Brands</h1>
					<ul>
						{brandCounts.map((brand) => (
							<li key={brand.brand}>
								<a href={routes.brands.show.href({ brand: brand.brand })}>
									{brand.brand} <span className="text-sm">({brand.count})</span>
								</a>
							</li>
						))}
					</ul>
				</div>,
			)
		},

		async show({ params }) {
			// let sneakers = await db.query.sneakers
			// 	.findMany({
			// 		where: eq(schema.sneakers.brand, params.brand),
			// 	})
			// 	.then((sneakers) => {
			// 		return sneakers.map((s) => serializeSneaker(s))
			// 	})

			let result = await db
				.select()
				.from(schema.sneakers)
				.where(eq(schema.sneakers.brand, params.brand))
			let sneakers = result.map((s) => serializeSneaker(s))

			return renderDocument(
				<div class="container">
					<h1>{params.brand}</h1>
					<SneakerGrid sneakers={sneakers} />
				</div>,
			)
		},
	},
} satisfies Controller<typeof routes.brands>
