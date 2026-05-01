import type { BrandFilterOption, ShowcaseResult } from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"

import { Pagination } from "./pagination.tsx"
import { ShowcaseFilters } from "./showcase-filters.tsx"
import { SneakerGrid } from "./sneaker-grid.tsx"

export type ShowcaseStatus = "all" | "owned" | "sold"

export interface ShowcaseSearchState {
	brand: string | null
	sort: "asc" | "desc"
	page: number
	perPage: 12 | 24
}

const tabClass =
	"rounded-full px-3 py-1.5 text-sm text-slate-500 no-underline ring-2 ring-transparent outline-none transition-colors hover:text-slate-700 focus-visible:ring-blue-500 aria-[current=page]:bg-blue-100 aria-[current=page]:font-semibold aria-[current=page]:text-blue-700 aria-[current=page]:hover:text-blue-700"

function ShowcaseStatusTabs() {
	return ({
		username,
		status,
	}: {
		username: string
		status: ShowcaseStatus
	}) => {
		return (
			<nav
				aria-label="Showcase status"
				class="inline-flex max-w-full gap-2 overflow-x-auto rounded-full border border-slate-300 bg-white p-1"
			>
				<a
					href={routes.showcase.user.href({ username })}
					aria-current={status === "all" ? "page" : undefined}
					class={tabClass}
				>
					All
				</a>
				<a
					href={routes.showcase.owned.href({ username })}
					aria-current={status === "owned" ? "page" : undefined}
					class={tabClass}
				>
					Owned
				</a>
				<a
					href={routes.showcase.sold.href({ username })}
					aria-current={status === "sold" ? "page" : undefined}
					class={tabClass}
				>
					Sold
				</a>
			</nav>
		)
	}
}

export function ShowcaseLayout() {
	return ({
		username,
		title,
		status,
		search,
		brands,
		showcase,
		basePath,
	}: {
		username: string
		title: string
		status: ShowcaseStatus
		search: ShowcaseSearchState
		brands: ReadonlyArray<BrandFilterOption>
		showcase: ShowcaseResult
		basePath: string
	}) => {
		return (
			<div class="min-h-dvh bg-[radial-gradient(80vw_60vw_at_100%_-10%,oklch(0.96_0.03_250/0.5),transparent_55%),radial-gradient(70vw_55vw_at_-10%_0%,oklch(0.96_0.02_170/0.5),transparent_50%),linear-gradient(180deg,oklch(0.99_0.002_260),oklch(0.98_0.004_260))] py-6 pb-10 text-slate-900 md:py-8 md:pb-12">
				<header class="container mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:gap-6">
					<div>
						<p class="mb-1 text-xs tracking-[0.08em] text-slate-500 uppercase">
							Sneaker showcase
						</p>
						<h1 class="text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.1] font-semibold">
							{title}
						</h1>
					</div>

					<ShowcaseStatusTabs username={username} status={status} />
				</header>

				<section class="container mb-5">
					<ShowcaseFilters
						brand={search.brand}
						brands={brands}
						sort={search.sort}
						perPage={search.perPage}
					/>
				</section>

				<section class="container">
					<SneakerGrid sneakers={showcase.sneakers} username={username} />
					<Pagination
						basePath={basePath}
						brand={search.brand}
						sort={search.sort}
						perPage={search.perPage}
						page={showcase.page}
						totalPages={showcase.totalPages}
					/>
				</section>
			</div>
		)
	}
}
