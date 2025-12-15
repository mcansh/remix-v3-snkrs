import type { SerializedSneaker } from "#app/models/sneaker.js"
import { routes } from "#app/routes.js"

export function EmptyState({ fullName }: { fullName: string }) {
	return (
		<div className="px-6">
			<h1 className="text-2xl font-medium">{fullName} has no sneakers in their collection</h1>
		</div>
	)
}

export function SneakerGrid({ sneakers }: { sneakers: ReadonlyArray<SerializedSneaker> }) {
	return (
		<ul class="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
			{sneakers.map((sneaker) => (
				<SneakerCard key={sneaker.id} {...sneaker} />
			))}
		</ul>
	)
}

export function SneakerCard({
	id,
	model,
	colorway,
	brand,
	image,
	srcSet,
	purchase_price,
}: SerializedSneaker) {
	return (
		<li>
			<div className="group relative">
				<div className="aspect-1 overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75">
					<img
						src={image}
						sizes="(min-width: 1024px) 25vw, 50vw"
						srcSet={srcSet}
						alt=""
						height={1200}
						width={1200}
					/>
				</div>
				<h3 className="mt-4 text-sm text-gray-700">
					<a href={routes.sneakers.show.href({ id })} data-component="SneakerCard">
						<span className="absolute inset-0" />
						{brand} {model}
					</a>
				</h3>
				<p className="mt-1 text-sm text-gray-500">{colorway}</p>
				<p className="mt-1 text-sm font-medium text-gray-900">{purchase_price}</p>
			</div>
		</li>
	)
}
