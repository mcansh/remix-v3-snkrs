"use client"

import type { SerializedSneaker } from "#src/models/sneaker.ts"

type SneakerGridProps = {
	sneakers: ReadonlyArray<SerializedSneaker>
}

export function SneakerGrid({ sneakers }: SneakerGridProps) {
	return (
		<ul class="container mx-auto grid lg:grid-cols-4">
			{sneakers.map((sneaker) => {
				return (
					<li key={sneaker.id} class="space-y-2">
						<img
							src={sneaker.image}
							srcSet={sneaker.srcSet}
							alt={`${sneaker.model} from ${sneaker.brand} in ${sneaker.colorway}`}
							class="rounded"
						/>

						<div class="flex">
							<div class="inline-flex rounded-full bg-black px-2 py-1 text-xs text-white">
								{sneaker.brand}
							</div>

							<a
								href={`/sneakers/${sneaker.id}`}
								class="inline-flex rounded-full bg-violet-400 px-2 py-1 text-xs text-white"
							>
								View
							</a>

							<a
								href={`/sneakers/${sneaker.id}/edit`}
								class="inline-flex rounded-full bg-orange-400 px-2 py-1 text-xs text-white"
							>
								Edit
							</a>
						</div>

						<p>{sneaker.model}</p>
						<p>{sneaker.colorway}</p>
						<p>{sneaker.purchase_price}</p>
					</li>
				)
			})}
		</ul>
	)
}
