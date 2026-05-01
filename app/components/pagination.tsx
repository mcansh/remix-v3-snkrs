export function Pagination() {
	return ({
		basePath,
		brand,
		sort,
		perPage,
		page,
		totalPages,
	}: {
		basePath: string
		brand: string | null
		sort: "asc" | "desc"
		perPage: 12 | 24
		page: number
		totalPages: number
	}) => {
		if (totalPages <= 1) return null

		return (
			<nav class="mt-4 flex flex-wrap gap-1.5" aria-label="Pagination">
				{Array.from({ length: totalPages }, (_, index) => {
					let nextPage = index + 1
					let query = new URLSearchParams()
					query.set("page", String(nextPage))
					query.set("sort", sort)
					query.set("perPage", String(perPage))
					if (brand) query.set("brand", brand)

					return (
						<a
							key={nextPage}
							href={`${basePath}?${query.toString()}`}
							aria-current={nextPage === page ? "page" : undefined}
							aria-label={`Go to page ${nextPage}`}
							class="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-600 no-underline ring-2 ring-transparent outline-none hover:border-slate-400 hover:text-slate-800 focus-visible:ring-blue-500 aria-[current=page]:border-transparent aria-[current=page]:bg-blue-600 aria-[current=page]:font-semibold aria-[current=page]:text-white aria-[current=page]:hover:border-transparent aria-[current=page]:hover:text-white"
						>
							{nextPage}
						</a>
					)
				})}
			</nav>
		)
	}
}
