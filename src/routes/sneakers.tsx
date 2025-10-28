import {
	redirect,
	type InferRouteHandler,
	type RouteHandlers,
} from "@remix-run/fetch-router"
import { eq } from "drizzle-orm"
import * as z from "zod/mini"

import { Document } from "../components/document"
import { SneakerGrid } from "../components/sneaker-grid"
import { schema } from "../db"
import { env } from "../lib/env"
import { render } from "../lib/html"
import { requireAuth } from "../middleware/auth"
import { createSneaker, getAllSneakers } from "../models/sneaker"
import { getUserById } from "../models/user"
import { routes } from "../routes"
import { getSession, getUserIdFromSession } from "../utils/session"

const sneakerIndexHandler: InferRouteHandler<typeof routes.sneakers.index> = {
	use: [requireAuth],
	async handler({ request }) {
		let session = getSession(request)
		let userId = getUserIdFromSession(session.sessionId)
		let user = userId ? await getUserById(userId) : null
		if (!user) return redirect(routes.auth.login.index.href())

		let sneakersWithData = await getAllSneakers(user.id)

		return render(
			<Document title="Your Sneakers">
				<div>
					<h1>Welcome, {user.username}!</h1>
					<p>Your sneakers:</p>

					<SneakerGrid sneakers={sneakersWithData} />
				</div>
			</Document>,
		)
	},
}

const sneakerUserHandler: InferRouteHandler<typeof routes.sneakers.user> = {
	use: [],
	async handler({ params }) {
		let user = await env.db.query.users.findFirst({
			where: eq(schema.users.username, params.user),
		})

		if (!user) {
			return render(
				<Document>
					<h1>User not found</h1>
				</Document>,
				{ status: 404, statusText: "Not Found" },
			)
		}

		let sneakers = await getAllSneakers(user.id)

		return render(
			<Document title={`${user.username}'s collection`}>
				<div>
					<h1>Welcome to {user.username}'s collection!</h1>

					<SneakerGrid sneakers={sneakers} />
				</div>
			</Document>,
		)
	},
}

const sneakerNewHandler: InferRouteHandler<typeof routes.sneakers.new> = {
	use: [requireAuth],
	handler() {
		let data = Object.freeze({
			brand: "Vans",
			model: "Slip On",
			colorway: "Black/White Checkerboard",
			size: 10,
			image: "shoes/erg1lxa8x29h1wtbog9a",
			purchase_price: 60_00,
			retail_price: 60_00,
			purchase_date: new Date().toISOString(),
		})

		return render(
			<Document title="New Sneaker">
				<h1>New Sneaker</h1>

				<form method="post" action={routes.sneakers.create.href()}>
					{Object.entries(data).map(([key, value]) => (
						<div key={key}>
							<input type="hidden" id={key} name={key} value={String(value)} />
						</div>
					))}
					<button class="bg-amber-300 px-4 py-2" type="submit">
						Create
					</button>
				</form>
			</Document>,
		)
	},
}

const sneakerCreateHandler: InferRouteHandler<typeof routes.sneakers.create> = {
	use: [requireAuth],
	async handler({ formData, request }) {
		let session = getSession(request)
		let userId = getUserIdFromSession(session.sessionId)
		let user = userId ? await getUserById(userId) : null
		if (!user) return redirect(routes.auth.login.index.href())
		let sneakerId = await createSneaker(formData, user.id)
		return redirect(routes.sneakers.show.href({ id: sneakerId }))
	},
}

const sneakerDestroyHandler: InferRouteHandler<typeof routes.sneakers.destroy> =
	{
		use: [requireAuth],
		async handler({ params, request }) {
			let session = getSession(request)
			let userId = getUserIdFromSession(session.sessionId)
			let user = userId ? await getUserById(userId) : null
			if (!user) return redirect(routes.auth.login.index.href())

			let destroySchema = z.object({ id: z.cuid2() })
			let result = destroySchema.parse(params)

			let deleted = await env.db
				.delete(schema.sneakers)
				.where(eq(schema.sneakers.id, result.id))

			console.log({ deleted })

			return redirect(routes.sneakers.index.href())
		},
	}

const sneakerEditHandler: InferRouteHandler<typeof routes.sneakers.edit> = {
	use: [requireAuth],
	async handler({ params }) {
		let sneaker = await env.db.query.sneakers.findFirst({
			where: eq(schema.sneakers.id, params.id),
		})

		if (!sneaker) {
			return render(
				<Document>
					<title>404 Not Found</title>
					<h1>404 Not Found</h1>
					<p>Sorry, the sneaker you are looking for does not exist.</p>
				</Document>,
				{ status: 404 },
			)
		}

		return render(
			<Document title={`Edit Sneaker ${params.id}`}>
				<title>Edit Sneaker</title>
				<h1>Edit Sneaker {params.id}</h1>
			</Document>,
		)
	},
}

const sneakerShowHandler: InferRouteHandler<typeof routes.sneakers.show> = {
	use: [],
	async handler({ params }) {
		let sneaker = await env.db.query.sneakers.findFirst({
			where: eq(schema.sneakers.id, params.id),
		})

		if (!sneaker) {
			return render(
				<Document>
					<title>404 Not Found</title>
					<h1>404 Not Found</h1>
				</Document>,
				{ status: 404 },
			)
		}

		return render(
			<Document>
				<title>Show Sneaker</title>
				<div class="mt-4">
					<h1>Show Sneaker {params.id}</h1>
					<div class="mt-10">
						<pre>{JSON.stringify(sneaker, null, 2)}</pre>
					</div>
				</div>
			</Document>,
		)
	},
}

const sneakerUpdateHandler: InferRouteHandler<typeof routes.sneakers.update> = {
	use: [requireAuth],
	handler({ params }) {
		return render(
			<Document>
				<title>Update Sneaker</title>
				<h1>Update Sneaker {params.id}</h1>
			</Document>,
		)
	},
}

export const sneakerHandlers = {
	new: sneakerNewHandler,
	create: sneakerCreateHandler,

	index: sneakerIndexHandler,
	show: sneakerShowHandler,
	user: sneakerUserHandler,

	edit: sneakerEditHandler,
	update: sneakerUpdateHandler,

	destroy: sneakerDestroyHandler,
} satisfies RouteHandlers<typeof routes.sneakers>
