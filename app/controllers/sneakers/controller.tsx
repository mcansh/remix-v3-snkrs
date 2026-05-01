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
			<div class="mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_oklch(0.2_0.03_250/0.08)]">
				<h1 class="text-2xl font-semibold text-slate-900">
					{isEditing ? "Edit Sneaker" : "Add Sneaker"}
				</h1>
				<p class="mt-1 text-sm text-slate-600">
					{isEditing
						? "Update the details for this pair in your collection."
						: "Add a new pair to your collection."}
				</p>

				<RestfulForm
					method={isEditing ? "put" : "post"}
					action={action}
					encType="multipart/form-data"
					class="mt-5 grid gap-4 md:grid-cols-2"
				>
					<label class="grid gap-1.5 text-sm text-slate-700" for="brand">
						Brand
						<input
							type="text"
							id="brand"
							name="brand"
							required
							defaultValue={sneaker?.brand}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="model">
						Model
						<input
							type="text"
							id="model"
							name="model"
							required
							defaultValue={sneaker?.model}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700 md:col-span-2" for="colorway">
						Colorway
						<input
							type="text"
							id="colorway"
							name="colorway"
							required
							defaultValue={sneaker?.colorway}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="size">
						Size
						<input
							type="number"
							inputMode="numeric"
							id="size"
							name="size"
							required
							defaultValue={sneaker?.size}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="purchase_date">
						Purchase Date
						<input
							type="date"
							id="purchase_date"
							name="purchase_date"
							required
							defaultValue={
								sneaker?.purchase_date?.toISOString().split("T")[0] ?? ""
							}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="purchase_price">
						Purchase Price (in cents)
						<input
							type="number"
							id="purchase_price"
							name="purchase_price"
							required
							min={0}
							defaultValue={sneaker?.purchase_price ?? ""}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="retail_price">
						Retail Price (in cents)
						<input
							type="number"
							id="retail_price"
							name="retail_price"
							required
							min={0}
							defaultValue={sneaker?.retail_price ?? ""}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700 md:col-span-2" for="image">
						Image
						<input
							type="file"
							id="image"
							name="image"
							accept="image/*"
							required={isEditing ? undefined : true}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{isEditing ? (
							<p class="text-xs text-slate-500">
								Leave empty to keep the existing image.
							</p>
						) : null}
					</label>

					<div class="md:col-span-2 mt-1 flex items-center gap-2">
						<button
							type="submit"
							class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
						>
							{isEditing ? "Update Sneaker" : "Create Sneaker"}
						</button>
						<a
							href={routes.sneakers.index.href()}
							class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:border-slate-400 hover:text-slate-900"
						>
							Cancel
						</a>
					</div>
				</RestfulForm>
			</div>
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
