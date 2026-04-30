import * as s from "remix/data-schema"
import { and, eq } from "drizzle-orm"
import type { BuildAction, Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"

import { Document } from "#src/components/document.tsx"
import { RestfulForm } from "#src/components/restful-form.tsx"
import { SneakerGrid } from "#src/components/sneaker-grid.tsx"
import { getDemoSneakers } from "#src/data/demo-sneakers.ts"
import { schema } from "#src/db/index.ts"
import type { Sneaker } from "#src/db/schema.ts"
import { env } from "#src/lib/env.ts"
import { render } from "#src/lib/html.tsx"
import { requireAuth } from "#src/middleware/auth.ts"
import {
	createSneaker,
	getAllSneakers,
	getSneakerById,
	updateSneaker,
} from "#src/models/sneaker.ts"
import { routes } from "#src/routes.ts"
import { getCurrentUser } from "#src/utils/context.ts"
import { isCuid2 } from "#src/utils/extra-schemas.ts"

const sneakerIndexHandler = {
	middleware: [requireAuth()],
	async handler() {
		let user = getCurrentUser()

		let sneakers = await getAllSneakers(user.id)

		return render(
			<Document head={<title>Your Sneakers</title>}>
				<div>
					<h1>Welcome, {user.username}!</h1>
					<div class="mt-4">
						<SneakerGrid sneakers={sneakers} />
					</div>
				</div>
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.sneakers.index>

const sneakerUserHandler = {
	middleware: [],
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
		let sneakersToRender = [...sneakers, ...getDemoSneakers(user.id, 10)]

		return render(
			<Document head={<title>{user.username}'s collection</title>}>
				<h1>Welcome to {user.username}'s collection!</h1>
				<SneakerGrid sneakers={sneakersToRender} />
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.sneakers.user>

const sneakerNewHandler = {
	middleware: [requireAuth()],
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

		return render(
			<Document head={<title>Add a new sneaker to your collection</title>}>
				<SneakerForm sneaker={data} isEditing={false} />
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.sneakers.new>

const sneakerCreateHandler = {
	middleware: [requireAuth()],
	async handler({ get }) {
		let formData = get(FormData)
		let user = getCurrentUser()
		let sneakerId = await createSneaker(formData, user.id)
		return redirect(routes.sneakers.show.href({ id: sneakerId }))
	},
} satisfies BuildAction<"POST", typeof routes.sneakers.create>

const sneakerDestroyHandler = {
	middleware: [requireAuth()],
	async handler({ params }) {
		let user = getCurrentUser()

		let destroySchema = s.object({ id: s.string().pipe(isCuid2()) })
		let result = s.parse(destroySchema, params)

		let deleted = await env.db
			.delete(schema.sneakers)
			.where(
				and(
					eq(schema.sneakers.id, result.id),
					eq(schema.sneakers.user_id, user.id),
				),
			)

		console.log({ deleted })

		return redirect(routes.sneakers.index.href())
	},
} satisfies BuildAction<"DELETE", typeof routes.sneakers.destroy>

const sneakerEditHandler = {
	middleware: [requireAuth()],
	async handler({ params }) {
		let sneaker = await getSneakerById(params.id)

		if (!sneaker) {
			return render(
				<Document head={<title>404 Not Found</title>}>
					<h1>404 Not Found</h1>
					<p>Sorry, the sneaker you are looking for does not exist.</p>
				</Document>,
				{ status: 404 },
			)
		}

		return render(
			<Document head={<title>Edit Sneaker</title>}>
				<SneakerForm sneaker={sneaker} isEditing={true} />
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.sneakers.edit>

const sneakerShowHandler = {
	middleware: [],
	async handler({ params }) {
		let sneaker = await getSneakerById(params.id, true, {
			srcSetSizes: [400, 800, 1200],
		})

		if (!sneaker) {
			return render(
				<Document head={<title>404 Not Found</title>}>
					<h1>404 Not Found</h1>
				</Document>,
				{ status: 404 },
			)
		}

		return render(
			<Document head={<title>Show Sneaker</title>}>
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
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.sneakers.show>

const sneakerUpdateHandler = {
	middleware: [requireAuth()],
	async handler({ get, params }) {
		let formData = get(FormData)
		await updateSneaker(params.id, formData)

		return redirect(routes.sneakers.show.href({ id: params.id }))
	},
} satisfies BuildAction<"PUT", typeof routes.sneakers.update>

function SneakerForm<T extends boolean>() {
	return ({
		sneaker,
		isEditing,
	}: {
		sneaker: T extends true ? Sneaker : never
		isEditing: T
	}) => {
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

					<button type="submit">
						{isEditing ? "Update" : "Create"} Sneaker
					</button>
				</fieldset>
			</RestfulForm>
		)
	}
}

export const sneakerHandlers = {
	actions: {
		new: sneakerNewHandler,
		create: sneakerCreateHandler,

		index: sneakerIndexHandler,
		show: sneakerShowHandler,
		user: sneakerUserHandler,

		edit: sneakerEditHandler,
		update: sneakerUpdateHandler,

		destroy: sneakerDestroyHandler,
	},
} satisfies Controller<typeof routes.sneakers>
