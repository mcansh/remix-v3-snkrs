import { Document } from "#app/components/document.tsx"
import {
	ShowcaseLayout,
	type ShowcaseSearchState,
	type ShowcaseStatus,
} from "#app/components/showcase-layout.tsx"
import { SneakerDetailViews } from "#app/components/sneaker-detail-views.tsx"
import type { BrandFilterOption } from "#app/models/sneaker.ts"
import type {
	SerializedSneaker,
	getSneakersForShowcase,
} from "#app/models/sneaker.ts"

export function ShowcaseUserNotFoundView() {
	return () => {
		return (
			<Document>
				<h1>User not found</h1>
			</Document>
		)
	}
}

export function ShowcaseView() {
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
		showcase: Awaited<ReturnType<typeof getSneakersForShowcase>>
		basePath: string
	}) => {
		return (
			<Document head={<title>{title}</title>}>
				<ShowcaseLayout
					username={username}
					title={title}
					status={status}
					search={search}
					brands={brands}
					showcase={showcase}
					basePath={basePath}
				/>
			</Document>
		)
	}
}

export function ShowcaseNotFoundView() {
	return () => {
		return (
			<Document head={<title>404 Not Found</title>}>
				<h1>404 Not Found</h1>
			</Document>
		)
	}
}

export function SneakerDetailView() {
	return ({
		sneaker,
		username,
	}: {
		sneaker: SerializedSneaker & {
			daysSincePurchase: number | null
		}
		username: string
	}) => {
		return (
			<Document head={<title>{`${sneaker.brand} ${sneaker.model}`}</title>}>
				<SneakerDetailViews sneaker={sneaker} username={username} />
			</Document>
		)
	}
}
