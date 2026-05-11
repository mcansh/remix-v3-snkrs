import { Document } from "#app/components/document.tsx"
import { generateDensitySrcSet } from "#app/lib/asset.ts"
import type { SneakerWithBrand } from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"

export function BrandShowView() {
	return ({
		brandLabel,
		showcase,
		user,
	}: {
		brandLabel: string
		showcase: {
			sneakers: Array<SneakerWithBrand>
			total: number
		}
		user: { username: string }
	}) => {
		return (
			<Document head={<title>{brandLabel}</title>}>
				<div class="min-h-dvh bg-[radial-gradient(80vw_60vw_at_100%_-10%,oklch(0.96_0.03_250/0.5),transparent_55%),radial-gradient(70vw_55vw_at_-10%_0%,oklch(0.96_0.02_170/0.5),transparent_50%),linear-gradient(180deg,oklch(0.99_0.002_260),oklch(0.98_0.004_260))] py-6 pb-10 text-slate-900 md:py-8 md:pb-12">
					<div class="container">
						<header class="mb-5 flex flex-wrap items-end justify-between gap-3">
							<div>
								<p class="mb-1 text-xs tracking-[0.08em] text-slate-500 uppercase">
									Brand detail
								</p>
								<h1 class="text-[clamp(1.5rem,2.2vw,2.2rem)] leading-[1.1] font-semibold">
									{brandLabel}
								</h1>
								<p class="mt-1 text-sm text-slate-600">
									{showcase.total} pair{showcase.total === 1 ? "" : "s"}
								</p>
							</div>
							<a
								href={routes.brands.index.href()}
								class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:border-slate-400 hover:text-slate-900"
							>
								Back to brands
							</a>
						</header>

						{showcase.sneakers.length === 0 ? (
							<div class="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
								No sneakers found for this brand.
							</div>
						) : (
							<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{showcase.sneakers.map((sneaker) => {
									let srcSet = generateDensitySrcSet({
										publicId: sneaker.image,
										sizes: [400, 800, 1200],
									})

									return (
										<li key={sneaker.id}>
											<a
												href={routes.showcase.show.href({
													username: user.username,
													sneakerId: sneaker.id,
												})}
												class="block overflow-hidden rounded-xl border border-slate-200 bg-white text-inherit no-underline transition-colors hover:border-slate-300"
											>
												<img
													src={srcSet.default}
													srcSet={srcSet.srcSet}
													alt={`${sneaker.brand.name} ${sneaker.model} - ${sneaker.colorway}`}
													class="aspect-square w-full bg-slate-50 object-cover"
												/>
												<div class="grid gap-1 px-3 py-2.5">
													<p class="text-sm font-semibold text-slate-900">
														{sneaker.model}
													</p>
													<p class="text-sm text-slate-600">
														{sneaker.colorway}
													</p>
													<p class="text-sm font-medium text-slate-900">
														{sneaker.purchase_price}
													</p>
												</div>
											</a>
										</li>
									)
								})}
							</ul>
						)}
					</div>
				</div>
			</Document>
		)
	}
}
