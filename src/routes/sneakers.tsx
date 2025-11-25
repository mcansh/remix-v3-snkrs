import * as z from "zod/mini"
import type { BuildRouteHandler, RouteHandlers } from "@remix-run/fetch-router"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { and, eq } from "drizzle-orm"

import { RestfulForm } from "#src/components/restful-form.tsx"
import { SneakerGrid } from "#src/components/sneaker-grid.tsx"
import { schema } from "#src/db/index.ts"
import type { Sneaker } from "#src/db/schema.ts"
import { env } from "#src/lib/env.ts"
import { renderDocument } from "#src/lib/html.tsx"
import { requireAuth } from "#src/middleware/auth.ts"
import {
	createSneaker,
	getAllSneakers,
	getSneakerById,
	updateSneaker,
} from "#src/models/sneaker.ts"
import { routes } from "#src/routes.ts"
import { getCurrentUser } from "#src/utils/context.ts"

const sneakerIndexHandler: BuildRouteHandler<
	"GET",
	typeof routes.sneakers.index
> = {
	middleware: [requireAuth],
	async handler() {
		let user = getCurrentUser()

		let sneakersWithData = await getAllSneakers(user.id)

		return renderDocument(
			<div>
				<title>Your Sneakers</title>
				<h1>Welcome, {user.username}!</h1>
				<p>Your sneakers:</p>

				<div class="mt-4">
					<SneakerGrid sneakers={sneakersWithData} />
				</div>
			</div>,
		)
	},
}

const sneakerUserHandler: BuildRouteHandler<
	"GET",
	typeof routes.sneakers.user
> = {
	middleware: [],
	async handler({ params }) {
		let user = await env.db.query.users.findFirst({
			where: eq(schema.users.username, params.user),
		})

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

				<SneakerGrid sneakers={sneakers} />
			</div>,
		)
	},
}

const sneakerNewHandler: BuildRouteHandler<"GET", typeof routes.sneakers.new> =
	{
		middleware: [requireAuth],
		handler() {
			let data = Object.freeze({
				brand: "Vans",
				model: "Slip On",
				colorway: "Black/White Checkerboard",
				size: 10,
				image: "shoes/erg1lxa8x29h1wtbog9a",
				purchase_price: 60_00,
				retail_price: 60_00,
				purchase_date: new Date(),
				created_at: new Date(),
				id: "",
				user_id: "",
				sold: false,
				sold_date: null,
				sold_price: null,
				updated_at: new Date(),
			} satisfies Sneaker)

			return renderDocument(
				<>
					<title>Add a new sneaker to your collection</title>
					<SneakerForm sneaker={data} isEditing={false} />
				</>,
			)
		},
	}

const sneakerCreateHandler: BuildRouteHandler<
	"POST",
	typeof routes.sneakers.create
> = {
	middleware: [requireAuth],
	async handler({ formData }) {
		let user = getCurrentUser()
		let sneakerId = await createSneaker(formData, user.id)
		return createRedirectResponse(routes.sneakers.show.href({ id: sneakerId }))
	},
}

const sneakerDestroyHandler: BuildRouteHandler<
	"DELETE",
	typeof routes.sneakers.destroy
> = {
	middleware: [requireAuth],
	async handler({ params }) {
		let user = getCurrentUser()

		let destroySchema = z.object({ id: z.cuid2() })
		let result = destroySchema.parse(params)

		let deleted = await env.db
			.delete(schema.sneakers)
			.where(
				and(
					eq(schema.sneakers.id, result.id),
					eq(schema.sneakers.user_id, user.id),
				),
			)

		console.log({ deleted })

		return createRedirectResponse(routes.sneakers.index.href())
	},
}

const sneakerEditHandler: BuildRouteHandler<
	"GET",
	typeof routes.sneakers.edit
> = {
	middleware: [requireAuth],
	async handler({ params }) {
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

				<SneakerForm sneaker={sneaker} isEditing={true} />
			</>,
		)
	},
}

const sneakerShowHandler: BuildRouteHandler<
	"GET",
	typeof routes.sneakers.show
> = {
	middleware: [],
	async handler({ params }) {
		let sneaker = await env.db.query.sneakers.findFirst({
			where: eq(schema.sneakers.id, params.id),
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
					<div class="mt-10">
						<pre>{JSON.stringify(sneaker, null, 2)}</pre>
					</div>
				</div>
			</>,
		)
	},
}

const sneakerUpdateHandler: BuildRouteHandler<
	"PUT",
	typeof routes.sneakers.update
> = {
	middleware: [requireAuth],
	async handler({ formData, params }) {
		await updateSneaker(params.id, formData)

		return createRedirectResponse(routes.sneakers.show.href({ id: params.id }))
	},
}

function SneakerForm<T extends boolean>({
	sneaker,
	isEditing,
}: {
	sneaker: T extends true ? Sneaker : never
	isEditing: T
}) {
	let action = isEditing
		? routes.sneakers.update.href({ id: sneaker.id })
		: routes.sneakers.create.href()

	return (
		<RestfulForm
			method={isEditing ? "put" : "post"}
			action={action}
			encType="multipart/form-data"
		>
			<fieldset>
				<legend>{isEditing ? "Edit Sneaker" : "New Sneaker"}</legend>

				<div>
					<label for="brand">Brand:</label>
					<input type="text" id="brand" name="brand" value={sneaker?.brand} />
				</div>

				<div>
					<label for="model">Model:</label>
					<input type="text" id="model" name="model" value={sneaker?.model} />
				</div>

				<div>
					<label for="colorway">Colorway:</label>
					<input
						type="text"
						id="colorway"
						name="colorway"
						value={sneaker?.colorway}
					/>
				</div>

				<div>
					<label for="size">Size:</label>
					<input
						type="text"
						inputMode="numeric"
						id="size"
						name="size"
						value={sneaker?.size}
					/>
				</div>

				<div>
					<label for="image">Image:</label>
					<input
						type="file"
						id="image"
						name="image"
						accept="image/*"
						value={sneaker?.image}
					/>
				</div>

				<div>
					<label for="purchase_price">Purchase Price (in cents):</label>
					<input
						type="number"
						id="purchase_price"
						name="purchase_price"
						value={sneaker?.purchase_price ?? ""}
					/>
				</div>

				<div>
					<label for="retail_price">Retail Price (in cents):</label>
					<input
						type="number"
						id="retail_price"
						name="retail_price"
						value={sneaker?.retail_price ?? ""}
					/>
				</div>

				<div>
					<label for="purchase_date">Purchase Date:</label>
					<input
						type="date"
						id="purchase_date"
						name="purchase_date"
						value={sneaker?.purchase_date?.toISOString().split("T")[0] ?? ""}
					/>
				</div>

				<button type="submit">{isEditing ? "Update" : "Create"} Sneaker</button>
			</fieldset>
		</RestfulForm>
	)
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
