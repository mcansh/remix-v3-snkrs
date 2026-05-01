import type { BrandFilterOption } from "#app/models/sneaker.ts"

export function ShowcaseFilters() {
	return ({
		brand,
		brands,
		sort,
		perPage,
		resetHref,
	}: {
		brand: string | null
		brands: ReadonlyArray<BrandFilterOption>
		sort: "asc" | "desc"
		perPage: 12 | 24
		resetHref?: string
	}) => {
		return (
			<form
				method="get"
				class="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
			>
				<label class="grid min-w-0 gap-1 text-xs text-slate-500">
					Brand
					<select
						name="brand"
						defaultValue={brand ?? ""}
						class="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 ring-2 ring-transparent outline-none focus-visible:ring-blue-500"
					>
						<option value="">All brands</option>
						{brands.map((entry) => (
							<option key={entry.brand_slug} value={entry.brand_slug}>
								{entry.brand}
							</option>
						))}
					</select>
				</label>

				<label class="grid min-w-0 gap-1 text-xs text-slate-500">
					Sort
					<select
						name="sort"
						defaultValue={sort}
						class="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 ring-2 ring-transparent outline-none focus-visible:ring-blue-500"
					>
						<option value="desc">Newest first</option>
						<option value="asc">Oldest first</option>
					</select>
				</label>

				<label class="grid min-w-0 gap-1 text-xs text-slate-500">
					Per page
					<select
						name="perPage"
						defaultValue={String(perPage)}
						class="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 ring-2 ring-transparent outline-none focus-visible:ring-blue-500"
					>
						<option value="12">12</option>
						<option value="24">24</option>
					</select>
				</label>

				<button
					type="submit"
					class="h-9 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white ring-2 ring-transparent transition-colors outline-none hover:bg-blue-500 focus-visible:ring-blue-500 sm:col-span-2 lg:col-span-1 lg:self-end"
				>
					Apply
				</button>

				{resetHref ? (
					<a
						href={resetHref}
						class="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:border-slate-400 hover:text-slate-900 sm:col-span-2 lg:col-span-1 lg:self-end"
					>
						Reset
					</a>
				) : null}
			</form>
		)
	}
}
