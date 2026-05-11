import { TZDate } from "@date-fns/tz"
import { differenceInDays } from "date-fns/differenceInDays"
import type { BuildAction } from "remix/fetch-router"
import type { Handle } from "remix/ui"

import { Document } from "#app/components/document.tsx"
import { render } from "#app/lib/html.tsx"
import { getSneakerById } from "#app/models/sneaker.ts"
import { getUserByUsername } from "#app/models/user.ts"
import type { routes } from "#app/routes.ts"

function ShowcaseNotFoundView(handle: Handle<{ username: string }>) {
	return () => {
		return (
			<Document
				head={<title>Showcase not found for {handle.props.username}</title>}
			>
				<div>Showcase not found for {handle.props.username}</div>
			</Document>
		)
	}
}

export const sneakerUserShowHandler = {
	middleware: [],
	async handler({ headers, params }) {
		let user = await getUserByUsername(params.username)

		if (user == null) {
			return render(<ShowcaseNotFoundView username={params.username} />, {
				status: 404,
			})
		}

		let sneaker = await getSneakerById(params.sneakerId)

		if (sneaker == null || sneaker.user_id !== user.id) {
			return render(<ShowcaseNotFoundView username={params.username} />, {
				status: 404,
			})
		}

		let daysSincePurchase: number | null = null
		let timezone = headers.get("cf-timezone") ?? "UTC"

		if (sneaker.purchase_date) {
			let now = new TZDate(new Date(), timezone)
			let purchaseDate = new TZDate(sneaker.purchase_date, timezone)
			daysSincePurchase = differenceInDays(now, purchaseDate)
		}

		return render(
			<Document
				head={
					<title>
						{sneaker.brand.name} {sneaker.model} {sneaker.colorway}
					</title>
				}
			>
				<div>
					<h1>
						{sneaker.brand.name} {sneaker.model} {sneaker.colorway}
					</h1>

					{daysSincePurchase != null ? (
						<h2>
							Purchased {daysSincePurchase} day
							{daysSincePurchase === 1 ? "" : "s"} ago
						</h2>
					) : null}
				</div>
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.showcase.show>
