import { Document } from "#app/components/document.tsx"
import { SneakerGrid } from "#app/components/sneaker-grid.tsx"
import type { SneakerWithBrand } from "#app/models/sneaker.ts"

export function SneakersIndexView() {
	return ({
		username,
		sneakers,
	}: {
		username: string
		sneakers: Array<SneakerWithBrand>
	}) => {
		return (
			<Document head={<title>Your Sneakers</title>}>
				<div>
					<h1>Welcome, {username}!</h1>
					<div class="mt-4">
						<SneakerGrid username={username} sneakers={sneakers} />
					</div>
				</div>
			</Document>
		)
	}
}
