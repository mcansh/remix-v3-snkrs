import type { SerializedSneaker } from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"

export function SneakerGrid() {
	return ({
		sneakers,
		username,
	}: {
		sneakers: ReadonlyArray<SerializedSneaker>
		username: string
	}) => {
		if (sneakers.length === 0) {
			return (
				<p class="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
					Collection is empty.
				</p>
			)
		}

		return (
			<div class="mt-4 grid grid-cols-2 gap-3 px-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
				{sneakers.map((sneaker) => (
					<a
						key={sneaker.id}
						href={routes.showcase.show.href({
							username,
							sneakerId: sneaker.id,
						})}
						class="group overflow-hidden rounded-xl border border-slate-200 bg-white text-inherit no-underline ring-2 ring-transparent transition-transform duration-200 ease-out outline-none hover:-translate-y-0.5 hover:shadow-[0_14px_30px_oklch(0.2_0.04_255/0.1)] focus-visible:ring-blue-500"
					>
						<img
							src={sneaker.image}
							srcSet={sneaker.srcSet}
							alt={`${sneaker.brand} ${sneaker.model} - ${sneaker.colorway}`}
							class="aspect-square w-full bg-slate-50 object-cover"
						/>
						<div class="grid gap-1 px-2.5 py-2.5 md:px-3 md:py-3">
							<p class="text-[0.78rem] tracking-[0.06em] text-slate-500 uppercase">
								{sneaker.brand}
							</p>
							<p class="text-sm leading-5 font-semibold text-slate-900">
								{sneaker.model}
							</p>
							<p class="text-sm text-slate-500">{sneaker.colorway}</p>
							<div class="mt-1 flex items-center justify-between">
								<p class="font-semibold text-slate-900">
									{sneaker.purchase_price}
								</p>
								{sneaker.sold ? (
									<span class="rounded-full bg-orange-100 px-2 py-0.5 text-[0.72rem] font-semibold text-orange-800">
										Sold
									</span>
								) : null}
							</div>
						</div>
					</a>
				))}
			</div>
		)
	}
}
