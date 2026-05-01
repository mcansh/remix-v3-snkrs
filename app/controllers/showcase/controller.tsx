import { Document } from "#app/components/document.tsx"
import {
	ShowcaseLayout,
	type ShowcaseSearchState,
	type ShowcaseStatus,
} from "#app/components/showcase-layout.tsx"
import { SneakerDetailViews } from "#app/components/sneaker-detail-views.tsx"
import { schema } from "#app/db/index.ts"
import { env } from "#app/env.ts"
import { render } from "#app/lib/html.tsx"
import {
	getBrandsForUser,
	getSneakerById,
	getSneakersForShowcase,
} from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"
import { TZDate } from "@date-fns/tz"
import { differenceInDays } from "date-fns/differenceInDays"
import { eq } from "drizzle-orm"
import type { BuildAction, Controller } from "remix/fetch-router"

function parseShowcaseSearch(urlOrSearchParams: URL | URLSearchParams) {
	let sp =
		urlOrSearchParams instanceof URL
			? urlOrSearchParams.searchParams
			: urlOrSearchParams

	let brand = sp.get("brand")
	let sort: "asc" | "desc" = sp.get("sort") === "asc" ? "asc" : "desc"
	let pageRaw = Number(sp.get("page") ?? "1")
	let perPageRaw = Number(sp.get("perPage") ?? "12")

	let page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
	let perPage = perPageRaw === 24 ? 24 : 12

	let search: ShowcaseSearchState = {
		brand,
		sort,
		page,
		perPage: perPage as 12 | 24,
	}

	return search
}

async function getUserByUsername(username: string) {
	return env.db.query.users.findFirst({
		where: eq(schema.users.username, username),
	})
}

function getShowcaseTitle(status: ShowcaseStatus, username: string): string {
	if (status === "owned") return `${username}'s owned sneakers`
	if (status === "sold") return `${username}'s sold sneakers`
	return `${username}'s collection`
}

function getShowcaseBasePath(status: ShowcaseStatus, username: string): string {
	if (status === "owned") return routes.showcase.owned.href({ username })
	if (status === "sold") return routes.showcase.sold.href({ username })
	return routes.showcase.user.href({ username })
}

async function renderShowcase(
	username: string,
	status: ShowcaseStatus,
	url: URL,
) {
	let user = await getUserByUsername(username)

	if (!user) {
		return render(
			<Document>
				<h1>User not found</h1>
			</Document>,
			{ status: 404, statusText: "Not Found" },
		)
	}

	let search = parseShowcaseSearch(url)
	let showcase = await getSneakersForShowcase(user.id, {
		status,
		brand: search.brand,
		sort: search.sort,
		page: search.page,
		perPage: search.perPage,
	})
	let brands = await getBrandsForUser(user.id)
	let title = getShowcaseTitle(status, user.username)
	let basePath = getShowcaseBasePath(status, user.username)

	console.log({ search, showcase, basePath, status, title })

	return render(
		<Document head={<title>{title}</title>}>
			<ShowcaseLayout
				username={user.username}
				title={title}
				status={status}
				search={search}
				brands={brands}
				showcase={showcase}
				basePath={basePath}
			/>
		</Document>,
	)
}

const sneakerUserHandler = {
	middleware: [],
	async handler({ params, url }) {
		return renderShowcase(params.username, "all", url)
	},
} satisfies BuildAction<"GET", typeof routes.showcase.user>

const sneakerUserOwnedHandler = {
	middleware: [],
	async handler({ params, url }) {
		return renderShowcase(params.username, "owned", url)
	},
} satisfies BuildAction<"GET", typeof routes.showcase.owned>

const sneakerUserSoldHandler = {
	middleware: [],
	async handler({ params, url }) {
		return renderShowcase(params.username, "sold", url)
	},
} satisfies BuildAction<"GET", typeof routes.showcase.sold>

const sneakerUserShowHandler = {
	middleware: [],
	async handler({ headers, params }) {
		let user = await env.db.query.users.findFirst({
			where: eq(schema.users.username, params.username),
		})

		if (!user) {
			return render(
				<Document head={<title>404 Not Found</title>}>
					<h1>404 Not Found</h1>
				</Document>,
				{ status: 404 },
			)
		}

		let sneaker = await getSneakerById(params.sneakerId, true, {
			srcSetSizes: [400, 800, 1200],
		})

		if (!sneaker || sneaker.user_id !== user.id) {
			return render(
				<Document head={<title>404 Not Found</title>}>
					<h1>404 Not Found</h1>
				</Document>,
				{ status: 404 },
			)
		}

		let daysSincePurchase: number | null = null
		let timezone = headers.get("cf-timezone") ?? "UTC"

		if (sneaker.purchase_date) {
			let now = new TZDate(new Date(), timezone)
			let purchaseDate = new TZDate(sneaker.purchase_date, timezone)
			daysSincePurchase = differenceInDays(now, purchaseDate)
		}

		return render(
			<Document head={<title>{`${sneaker.brand} ${sneaker.model}`}</title>}>
				<SneakerDetailViews
					sneaker={{ ...sneaker, daysSincePurchase }}
					username={user.username}
				/>
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.showcase.show>

export const showcaseHandlers = {
	actions: {
		user: sneakerUserHandler,
		owned: sneakerUserOwnedHandler,
		sold: sneakerUserSoldHandler,
		show: sneakerUserShowHandler,
	},
} satisfies Controller<typeof routes.showcase>
