import { eq } from "drizzle-orm"
import type { Controller } from "remix/fetch-router"

import { Document } from "#app/components/document.tsx"
import { schema } from "#app/db/index.ts"
import { env } from "#app/env.ts"
import { render } from "#app/lib/html.tsx"
import { requireAuth } from "#app/middleware/auth.ts"
import { getSneakersForShowcase } from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"
import { getCurrentUser } from "#app/utils/context.ts"

export const brandHandlers = {
	middleware: [requireAuth],
	actions: {
		async index() {
			let user = getCurrentUser()
			let sneakers = await env.db.query.sneakers.findMany({
				where: eq(schema.sneakers.user_id, user.id),
			})
			let grouped = Object.groupBy(sneakers, (sneaker) => sneaker.brand)
			let brandCounts = Object.entries(grouped)
				.map(([brand, sneakers]) => ({
					brand,
					count: sneakers?.length ?? 0,
					slug: brand.trim().toLowerCase().replace(/\s+/g, "-"),
				}))
				.toSorted((a, b) => {
					return (
						b.brand.length - a.brand.length || a.brand.localeCompare(b.brand)
					)
				})

			return render(
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
													{brand.brand}
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
				</Document>,
			)
		},

		async show({ params }) {
			let user = getCurrentUser()
			let showcase = await getSneakersForShowcase(user.id, {
				status: "all",
				brand: params.brand,
				sort: "desc",
				page: 1,
				perPage: 24,
			})

			let brandLabel =
				showcase.sneakers.at(0)?.brand ??
				params.brand
					.split("-")
					.filter(Boolean)
					.map((part) => part[0]?.toUpperCase() + part.slice(1))
					.join(" ")

			return render(
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
										{showcase.total} pairs
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
									{showcase.sneakers.map((sneaker) => (
										<li key={sneaker.id}>
											<a
												href={routes.showcase.show.href({
													username: user.username,
													sneakerId: sneaker.id,
												})}
												class="block overflow-hidden rounded-xl border border-slate-200 bg-white text-inherit no-underline transition-colors hover:border-slate-300"
											>
												<img
													src={sneaker.image}
													srcSet={sneaker.srcSet}
													alt={`${sneaker.brand} ${sneaker.model} - ${sneaker.colorway}`}
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
									))}
								</ul>
							)}
						</div>
					</div>
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.brands>
