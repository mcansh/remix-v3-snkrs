import type { SerializedSneaker } from "#src/models/sneaker.ts"
import { routes } from "#src/routes.ts"
import { RestfulForm } from "./restful-form.tsx"

type SneakerGridProps = {
	sneakers: ReadonlyArray<SerializedSneaker>
}

export function SneakerGrid() {
	return ({ sneakers }: SneakerGridProps) => {
		return (
			<ul class="container grid gap-6 lg:grid-cols-4">
				{sneakers.map((sneaker) => {
					return (
						<li key={sneaker.id} class="space-y-2">
							<img
								src={sneaker.image}
								srcSet={sneaker.srcSet}
								alt={`${sneaker.model} from ${sneaker.brand} in ${sneaker.colorway}`}
								class="aspect-square rounded bg-slate-300"
								height={256}
								width={256}
							/>

							<div class="flex gap-2">
								<a href={routes.brands.show.href({ brand: sneaker.brand })}>
									<span class="text-trim-both text-edge-cap-alphabetic inline-flex rounded-full bg-black px-2 py-1 text-xs text-white">
										{sneaker.brand}
									</span>
								</a>

								<a href={routes.sneakers.show.href({ id: sneaker.id })}>
									<span class="text-trim-both text-edge-cap-alphabetic inline-flex rounded-full bg-green-400 px-2 py-1 text-xs text-white">
										View
									</span>
								</a>

								<a href={routes.sneakers.edit.href({ id: sneaker.id })}>
									<span class="text-trim-both text-edge-cap-alphabetic inline-flex rounded-full bg-orange-400 px-2 py-1 text-xs text-white">
										Edit
									</span>
								</a>

								<RestfulForm
									method="DELETE"
									action={routes.sneakers.destroy.href({ id: sneaker.id })}
								>
									<button
										type="submit"
										class="inline-flex rounded-full bg-red-400 px-2 py-1 text-xs text-white"
									>
										Delete
									</button>
								</RestfulForm>
							</div>

							<p data-testid="sneaker.model">{sneaker.model}</p>
							<p data-testid="sneaker.colorway">{sneaker.colorway}</p>
							<p data-testid="sneaker.purchase_price">
								{sneaker.purchase_price}
							</p>
						</li>
					)
				})}
			</ul>
		)
	}
}
