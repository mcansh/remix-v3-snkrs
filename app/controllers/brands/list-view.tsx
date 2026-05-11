import { Document } from "#app/components/document.tsx"
import type { BrandFilterOption } from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"

export function BrandsList() {
	return ({ brandCounts }: { brandCounts: Array<BrandFilterOption> }) => {
		return (
			<Document head={<title>Brands</title>}>
				<div class="min-h-dvh bg-[radial-gradient(80vw_60vw_at_100%_-10%,oklch(0.96_0.03_250/0.5),transparent_55%),radial-gradient(70vw_55vw_at_-10%_0%,oklch(0.96_0.02_170/0.5),transparent_50%),linear-gradient(180deg,oklch(0.99_0.002_260),oklch(0.98_0.004_260))] py-6 pb-10 text-slate-900 md:py-8 md:pb-12">
					<div class="container">
						<header class="mb-5">
							<p class="mb-1 text-xs tracking-[0.08em] text-slate-500 uppercase">
								Brand directory
							</p>
							<h1 class="text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.1] font-semibold">
								Your sneaker brands
							</h1>
							<p class="mt-1 text-sm text-slate-600">
								{brandCounts.length} brands in your collection
							</p>
						</header>

						{brandCounts.length === 0 ? (
							<div class="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
								No brands yet. Add your first sneaker to start building this
								list.
							</div>
						) : (
							<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{brandCounts.map((brand) => (
									<li key={brand.slug}>
										<a
											href={routes.brands.show.href({ brand: brand.slug })}
											class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-inherit no-underline transition-colors hover:border-slate-300"
										>
											<span class="font-medium text-slate-900">
												{brand.name}
											</span>
											<span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
												{brand.count}
											</span>
										</a>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</Document>
		)
	}
}
