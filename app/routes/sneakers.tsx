import { SneakerForm } from "#app/assets/sneaker-form.js"
import { EmptyState, SneakerGrid } from "#app/components/sneaker.js"
import { db, schema } from "#app/db/index.js"
import { renderDocument } from "#app/lib/html.js"
import { requireAuth } from "#app/middleware/auth.js"
import {
	createSneaker,
	getAllSneakers,
	getSneakerById,
	updateSneaker,
} from "#app/models/sneaker.js"
import { routes } from "#app/routes.js"
import { getCurrentUser } from "#app/utils/context.js"
import type { BuildAction, Controller } from "@remix-run/fetch-router"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { and, eq } from "drizzle-orm"
import * as z from "zod/mini"

const sneakerIndexHandler: BuildAction<"GET", typeof routes.sneakers.index> = {
	middleware: [requireAuth()],
	async action() {
		let user = getCurrentUser()

		let sneakersWithData = await getAllSneakers(user.id)

		return renderDocument(
			<div>
				<title>Your Sneakers</title>
				<h1>Welcome, {user.username}!</h1>
				<p>Your sneakers:</p>

				<div class="mt-4">
					{sneakersWithData.length > 0 ? (
						<SneakerGrid sneakers={sneakersWithData} />
					) : (
						<EmptyState fullName={user.given_name + " " + user.family_name} />
					)}
				</div>
			</div>,
		)
	},
}

const sneakerUserHandler: BuildAction<"GET", typeof routes.sneakers.user> = {
	middleware: [],
	async action({ params }) {
		let result = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.username, params.user))
			.limit(1)
		let user = result.at(0)

		if (!user) {
			return renderDocument(<h1>User not found</h1>, {
				status: 404,
				statusText: "Not Found",
			})
		}

		let sneakers = await getAllSneakers(user.id)

		return renderDocument(
			<div>
				<title>{user.username}'s collection</title>
				<h1>Welcome to {user.username}'s collection!</h1>

				<div class="mt-4">
					{sneakers.length > 0 ? (
						<SneakerGrid sneakers={sneakers} />
					) : (
						<EmptyState fullName={user.given_name + " " + user.family_name} />
					)}
				</div>
			</div>,
		)
	},
}

const sneakerNewHandler: BuildAction<"GET", typeof routes.sneakers.new> = {
	middleware: [requireAuth()],
	action() {
		return renderDocument(
			<>
				<title>Add a new sneaker to your collection</title>
				<main className="container mx-auto h-full p-4 pb-6">
					<h2 className="py-4 text-lg">Add a sneaker to your collection</h2>
					<SneakerForm />
				</main>
			</>,
		)
	},
}

const sneakerCreateHandler: BuildAction<"POST", typeof routes.sneakers.create> = {
	middleware: [requireAuth()],
	async action({ formData }) {
		let user = getCurrentUser()
		let sneakerId = await createSneaker(formData, user.id)
		return createRedirectResponse(routes.sneakers.show.href({ id: sneakerId }))
	},
}

const sneakerDestroyHandler: BuildAction<"DELETE", typeof routes.sneakers.destroy> = {
	middleware: [requireAuth()],
	async action({ params }) {
		let user = getCurrentUser()

		let destroySchema = z.object({ id: z.cuid2() })
		let result = destroySchema.parse(params)

		let deleted = await db
			.delete(schema.sneakers)
			.where(and(eq(schema.sneakers.id, result.id), eq(schema.sneakers.user_id, user.id)))

		console.log({ deleted })

		return createRedirectResponse(routes.sneakers.index.href())
	},
}

const sneakerEditHandler: BuildAction<"GET", typeof routes.sneakers.edit> = {
	middleware: [requireAuth()],
	async action({ params }) {
		let sneaker = await getSneakerById(params.id)

		if (!sneaker) {
			return renderDocument(
				<>
					<title>404 Not Found</title>
					<h1>404 Not Found</h1>
					<p>Sorry, the sneaker you are looking for does not exist.</p>
				</>,
				{ status: 404 },
			)
		}

		return renderDocument(
			<>
				<title>Edit Sneaker</title>

				<SneakerForm sneaker={sneaker} />
			</>,
		)
	},
}

const sneakerShowHandler: BuildAction<"GET", typeof routes.sneakers.show> = {
	middleware: [],
	async action({ params }) {
		let sneaker = await getSneakerById(params.id, true, {
			srcSetSizes: [400, 800, 1200],
		})

		if (!sneaker) {
			return renderDocument(
				<>
					<title>404 Not Found</title>
					<h1>404 Not Found</h1>
				</>,
				{ status: 404 },
			)
		}

		return renderDocument(
			<>
				<title>Show Sneaker</title>
				<div class="mt-4">
					<h1>Show Sneaker {params.id}</h1>

					<div class="grid gap-4 md:grid-cols-3">
						<div class="col-span-2">
							<img
								src={sneaker.image}
								alt={sneaker.model}
								class="aspect-square w-full"
								srcSet={sneaker.srcSet}
							/>
							<h2>Brand</h2>
							<p>{sneaker.brand}</p>
						</div>
						<div>
							<h2>Model</h2>
							<p>{sneaker.model}</p>

							<h2>Colorway</h2>
							<p>{sneaker.colorway}</p>

							<h2>Purchase Date</h2>
							<p>{sneaker.purchase_date}</p>

							<h2>Purchase Price</h2>
							<p>{sneaker.purchase_price}</p>

							<h2>Size</h2>
							<p>{sneaker.size}</p>
						</div>
					</div>

					<div class="mt-10">
						<pre>{JSON.stringify(sneaker, null, 2)}</pre>
					</div>
				</div>
			</>,
		)
	},
}

const sneakerUpdateHandler: BuildAction<"PUT", typeof routes.sneakers.update> = {
	middleware: [requireAuth()],
	async action({ formData, params }) {
		await updateSneaker(params.id, formData)

		return createRedirectResponse(routes.sneakers.show.href({ id: params.id }))
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
} satisfies Controller<typeof routes.sneakers>
