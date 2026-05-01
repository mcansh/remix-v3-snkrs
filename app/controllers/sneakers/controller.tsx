import { and, eq } from "drizzle-orm"
import * as s from "remix/data-schema"
import type { BuildAction, Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"

import { Document } from "#app/components/document.tsx"
import { RestfulForm } from "#app/components/restful-form.tsx"
import { SneakerGrid } from "#app/components/sneaker-grid.tsx"
import { schema } from "#app/db/index.ts"
import type { Sneaker } from "#app/db/schema.ts"
import { env } from "#app/env.ts"
import { render } from "#app/lib/html.tsx"
import { requireAuth } from "#app/middleware/auth.ts"
import {
	createSneaker,
	getAllSneakers,
	getSneakerById,
	updateSneaker,
} from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"
import { getCurrentUser } from "#app/utils/context.ts"
import { isCuid2 } from "#app/utils/extra-schemas.ts"
const sneakerIndexHandler = {
	middleware: [requireAuth],
	async handler() {
		let user = getCurrentUser()

		let sneakers = await getAllSneakers(user.id)

		return render(
			<Document head={<title>Your Sneakers</title>}>
				<div>
					<h1>Welcome, {user.username}!</h1>
					<div class="mt-4">
						<SneakerGrid username={user.username} sneakers={sneakers} />
					</div>
				</div>
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.sneakers.index>

const sneakerNewHandler = {
	middleware: [requireAuth],
	handler() {
		return render(
			<Document head={<title>Add a new sneaker to your collection</title>}>
				<SneakerForm isEditing={false} action={routes.sneakers.create.href()} />
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.sneakers.new>

const sneakerCreateHandler = {
	middleware: [requireAuth],
	async handler({ get }) {
		let formData = get(FormData)
		let user = getCurrentUser()
		let sneakerId = await createSneaker(formData, user.id)
		return redirect(
			routes.showcase.show.href({ username: user.username, sneakerId }),
		)
	},
} satisfies BuildAction<"POST", typeof routes.sneakers.create>

const sneakerDestroyHandler = {
	middleware: [requireAuth],
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
	middleware: [requireAuth],
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
				<SneakerForm
					sneaker={sneaker}
					isEditing={true}
					action={routes.sneakers.update.href({ id: sneaker.id })}
				/>
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.sneakers.edit>

const sneakerUpdateHandler = {
	middleware: [requireAuth],
	async handler({ get, params }) {
		let formData = get(FormData)
		await updateSneaker(params.id, formData)
		let user = getCurrentUser()

		return redirect(
			routes.showcase.show.href({
				sneakerId: params.id,
				username: user.username,
			}),
		)
	},
} satisfies BuildAction<"PUT", typeof routes.sneakers.update>

function SneakerForm<T extends boolean>() {
	return ({
		sneaker,
		isEditing,
		action,
	}: {
		sneaker?: T extends true ? Sneaker : never
		isEditing: T
		action: string
	}) => {
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

		edit: sneakerEditHandler,
		update: sneakerUpdateHandler,

		destroy: sneakerDestroyHandler,
	},
} satisfies Controller<typeof routes.sneakers>
