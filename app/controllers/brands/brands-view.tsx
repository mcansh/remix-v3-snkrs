import { Document } from "#app/components/document.tsx"
import type { getSneakersForShowcase } from "#app/models/sneaker.ts"

import { BrandsList } from "./brands-list.tsx"
import { BrandShow } from "./show.tsx"

type BrandCount = {
	brand: string
	count: number
	slug: string
}

export function renderBrandsIndexView({
	brandCounts,
}: {
	brandCounts: Array<BrandCount>
}) {
	return (
		<Document head={<title>Brands</title>}>
			<BrandsList brandCounts={brandCounts} />
		</Document>
	)
}

export function renderBrandShowView({
	brandLabel,
	showcase,
	user,
}: {
	brandLabel: string
	showcase: Awaited<ReturnType<typeof getSneakersForShowcase>>
	user: { username: string }
}) {
	return (
		<Document head={<title>{brandLabel}</title>}>
			<BrandShow brandLabel={brandLabel} showcase={showcase} user={user} />
		</Document>
	)
}
