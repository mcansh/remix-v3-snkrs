"use client"

import type { getAllSneakers } from "../models/sneaker"

type SneakerGridProps = {
	sneakers: Awaited<ReturnType<typeof getAllSneakers>>
}

export function SneakerGrid({ sneakers }: SneakerGridProps) {
	return (
		<ul class="grid lg:grid-cols-4">
			{sneakers.map((sneaker) => {
				return (
					<li key={sneaker.id}>
						<img
							src={sneaker.image}
							srcSet={sneaker.srcSet}
							alt={`${sneaker.model} from ${sneaker.brand} in ${sneaker.colorway}`}
							class=""
						/>

						<div class="inline-flex rounded-full bg-black px-2 py-1 text-sm text-white">
							{sneaker.brand}
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
