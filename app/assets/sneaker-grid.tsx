import type { Remix } from "@remix-run/dom"
import { hydrated } from "@remix-run/dom"

import { SneakerCard } from "#app/components/sneaker.js"
import type { SerializedSneaker } from "#app/models/sneaker.js"
import { routes } from "#app/routes.js"

export const SneakerGrid = hydrated(
	routes.assets.href({ path: "sneaker-grid.js#SneakerGrid" }),
	function SneakerGrid(
		this: Remix.Handle,
		{ sneakers }: { sneakers: Array<SerializedSneaker> },
	) {
		return () => (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{sneakers.map((sneaker) => (
					<SneakerCard key={sneaker.id} sneaker={sneaker} />
				))}
			</div>
		)
	},
)
