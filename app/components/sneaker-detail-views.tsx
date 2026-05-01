import type { SerializedSneaker } from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"
import type { RemixNode } from "remix/ui"

function ViewCard() {
	return ({
		title,
		description,
		children,
	}: {
		title: string
		description: string
		children: RemixNode
	}) => (
		<article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_oklch(0.2_0.03_250/0.08)]">
			<header class="border-b border-slate-200 bg-slate-50 px-4 py-3 md:px-5">
				<h2 class="text-base font-semibold text-slate-900">{title}</h2>
				<p class="mt-1 text-sm text-slate-600">{description}</p>
			</header>
			<div class="p-2.5 md:p-3">{children}</div>
		</article>
	)
}

export function SneakerDetailViews() {
	return ({
		sneaker,
		username,
	}: {
		sneaker: SerializedSneaker & { daysSincePurchase: number | null }
		username: string
	}) => {
		return (
			<div class="min-h-dvh bg-[radial-gradient(85vw_70vw_at_90%_-10%,oklch(0.96_0.03_250/0.55),transparent_55%),radial-gradient(75vw_65vw_at_-10%_10%,oklch(0.96_0.03_175/0.4),transparent_55%),linear-gradient(180deg,oklch(0.99_0.003_260),oklch(0.98_0.006_260))] py-6 pb-12 text-slate-900 md:py-8">
				<header class="container mb-5 flex flex-wrap items-center justify-between gap-3">
					<div>
						<p class="text-xs tracking-[0.08em] text-slate-500 uppercase">
							Sneaker spotlight
						</p>
						<h1 class="mt-1 text-[clamp(1.4rem,2.1vw,2rem)] leading-[1.1] font-semibold">
							{sneaker.brand} {sneaker.model}
						</h1>
						<p class="mt-1 text-sm text-slate-600">{sneaker.colorway}</p>
					</div>
					<a
						href={routes.showcase.user.href({ username })}
						class="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 no-underline transition-colors hover:border-slate-400"
					>
						Back to collection
					</a>
				</header>

				<section class="container">
					<ViewCard
						title="Sneaker Details"
						description="Quick overview of the pair and key stats."
					>
						<div class="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] md:items-start md:gap-3">
							<div class="w-full max-w-80 md:max-w-96">
								<img
									src={sneaker.image}
									srcSet={sneaker.srcSet}
									alt={`${sneaker.brand} ${sneaker.model} - ${sneaker.colorway}`}
									class="aspect-square w-full rounded-xl bg-slate-100 object-cover"
								/>
							</div>
							<div class="grid gap-3">
								<div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
									<p class="text-xs tracking-[0.08em] text-slate-500 uppercase">
										Status
									</p>
									<p class="font-semibold text-slate-900">
										{sneaker.sold ? "Sold" : "Owned"}
									</p>
								</div>
								<div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
									<p class="text-xs tracking-[0.08em] text-slate-500 uppercase">
										Price
									</p>
									<p class="font-semibold text-slate-900">
										{sneaker.sold_price ?? sneaker.retail_price}
									</p>
								</div>
								<div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
									<p class="text-xs tracking-[0.08em] text-slate-500 uppercase">
										Size
									</p>
									<p class="font-semibold text-slate-900">US {sneaker.size}</p>
								</div>
								{sneaker.daysSincePurchase ? (
									<div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
										<p class="text-xs tracking-[0.08em] text-slate-500 uppercase">
											Days since purchase
										</p>
										<p class="font-semibold text-slate-900">
											{sneaker.daysSincePurchase}
										</p>
									</div>
								) : null}
							</div>
						</div>
					</ViewCard>
				</section>
			</div>
		)
	}
}
