import { and, eq } from "drizzle-orm"
import * as s from "remix/data-schema"
import type { BuildAction, Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

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

type SneakerFormValues = {
	brand?: string
	model?: string
	colorway?: string
	size?: string
	purchase_date?: string
	purchase_price?: string
	retail_price?: string
}

type SneakerFormErrors = {
	brand?: string
	model?: string
	colorway?: string
	size?: string
	purchase_date?: string
	purchase_price?: string
	retail_price?: string
	image?: string
	general?: string
}

function getSneakerFormValues(formData: FormData): SneakerFormValues {
	return {
		brand: String(formData.get("brand") ?? ""),
		model: String(formData.get("model") ?? ""),
		colorway: String(formData.get("colorway") ?? ""),
		size: String(formData.get("size") ?? ""),
		purchase_date: String(formData.get("purchase_date") ?? ""),
		purchase_price: String(formData.get("purchase_price") ?? ""),
		retail_price: String(formData.get("retail_price") ?? ""),
	}
}

function validateSneakerForm(
	formData: FormData,
	options: { isEditing: boolean },
): SneakerFormErrors {
	let values = getSneakerFormValues(formData)
	let errors: SneakerFormErrors = {}

	if (!values.brand?.trim()) errors.brand = "Brand is required."
	if (!values.model?.trim()) errors.model = "Model is required."
	if (!values.colorway?.trim()) errors.colorway = "Colorway is required."
	if (!values.purchase_date?.trim()) {
		errors.purchase_date = "Purchase date is required."
	}

	let size = Number(values.size)
	if (!values.size?.trim()) {
		errors.size = "Size is required."
	} else if (!Number.isFinite(size) || size <= 0) {
		errors.size = "Size must be a positive number."
	}

	let purchasePrice = Number(values.purchase_price)
	if (!values.purchase_price?.trim()) {
		errors.purchase_price = "Purchase price is required."
	} else if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
		errors.purchase_price = "Purchase price must be zero or greater."
	}

	let retailPrice = Number(values.retail_price)
	if (!values.retail_price?.trim()) {
		errors.retail_price = "Retail price is required."
	} else if (!Number.isFinite(retailPrice) || retailPrice < 0) {
		errors.retail_price = "Retail price must be zero or greater."
	}

	if (!options.isEditing) {
		let image = formData.get("image")
		if (!(image instanceof File) || !image.name) {
			errors.image = "Image is required."
		}
	}

	return errors
}

function hasSneakerFormErrors(errors: SneakerFormErrors): boolean {
	return Object.values(errors).some((value) => typeof value === "string")
}

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
	handler({ get }) {
		let session = get(Session)
		let formErrors = session.get("formErrors") as SneakerFormErrors | undefined
		let formValues = session.get("formValues") as SneakerFormValues | undefined

		return render(
			<Document head={<title>Add a new sneaker to your collection</title>}>
				<SneakerForm
					isEditing={false}
					action={routes.sneakers.create.href()}
					formErrors={formErrors}
					formValues={formValues}
				/>
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.sneakers.new>

const sneakerCreateHandler = {
	middleware: [requireAuth],
	async handler({ get }) {
		let formData = get(FormData)
		let session = get(Session)
		let formValues = getSneakerFormValues(formData)
		let formErrors = validateSneakerForm(formData, { isEditing: false })

		if (hasSneakerFormErrors(formErrors)) {
			session.flash("formErrors", formErrors)
			session.flash("formValues", formValues)
			return redirect(routes.sneakers.new.href())
		}

		let user = getCurrentUser()

		let sneakerId: string
		try {
			sneakerId = await createSneaker(formData, user.id)
		} catch {
			session.flash("formErrors", {
				general: "Failed to create sneaker. Please try again.",
			} satisfies SneakerFormErrors)
			session.flash("formValues", formValues)
			return redirect(routes.sneakers.new.href())
		}

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
	async handler({ params, get }) {
		let session = get(Session)
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
					formErrors={session.get("formErrors") as SneakerFormErrors | undefined}
					formValues={session.get("formValues") as SneakerFormValues | undefined}
				/>
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.sneakers.edit>

const sneakerUpdateHandler = {
	middleware: [requireAuth],
	async handler({ get, params }) {
		let formData = get(FormData)
		let session = get(Session)
		let formValues = getSneakerFormValues(formData)
		let formErrors = validateSneakerForm(formData, { isEditing: true })

		if (hasSneakerFormErrors(formErrors)) {
			session.flash("formErrors", formErrors)
			session.flash("formValues", formValues)
			return redirect(routes.sneakers.edit.href({ id: params.id }))
		}

		try {
			await updateSneaker(params.id, formData)
		} catch {
			session.flash("formErrors", {
				general: "Failed to update sneaker. Please try again.",
			} satisfies SneakerFormErrors)
			session.flash("formValues", formValues)
			return redirect(routes.sneakers.edit.href({ id: params.id }))
		}

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
		formErrors,
		formValues,
	}: {
		sneaker?: T extends true ? Sneaker : never
		isEditing: T
		action: string
		formErrors?: SneakerFormErrors
		formValues?: SneakerFormValues
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

				{formErrors?.general ? (
					<div class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
						{formErrors.general}
					</div>
				) : null}

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
							defaultValue={formValues?.brand ?? sneaker?.brand}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.brand ? (
							<span class="text-xs text-rose-700">{formErrors.brand}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="model">
						Model
						<input
							type="text"
							id="model"
							name="model"
							required
							defaultValue={formValues?.model ?? sneaker?.model}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.model ? (
							<span class="text-xs text-rose-700">{formErrors.model}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700 md:col-span-2" for="colorway">
						Colorway
						<input
							type="text"
							id="colorway"
							name="colorway"
							required
							defaultValue={formValues?.colorway ?? sneaker?.colorway}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.colorway ? (
							<span class="text-xs text-rose-700">{formErrors.colorway}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="size">
						Size
						<input
							type="number"
							inputMode="numeric"
							id="size"
							name="size"
							required
							defaultValue={formValues?.size ?? sneaker?.size}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.size ? (
							<span class="text-xs text-rose-700">{formErrors.size}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="purchase_date">
						Purchase Date
						<input
							type="date"
							id="purchase_date"
							name="purchase_date"
							required
							defaultValue={
								formValues?.purchase_date ??
								sneaker?.purchase_date?.toISOString().split("T")[0] ??
								""
							}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.purchase_date ? (
							<span class="text-xs text-rose-700">{formErrors.purchase_date}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="purchase_price">
						Purchase Price (in cents)
						<input
							type="number"
							id="purchase_price"
							name="purchase_price"
							required
							min={0}
							defaultValue={formValues?.purchase_price ?? sneaker?.purchase_price ?? ""}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.purchase_price ? (
							<span class="text-xs text-rose-700">{formErrors.purchase_price}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="retail_price">
						Retail Price (in cents)
						<input
							type="number"
							id="retail_price"
							name="retail_price"
							required
							min={0}
							defaultValue={formValues?.retail_price ?? sneaker?.retail_price ?? ""}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.retail_price ? (
							<span class="text-xs text-rose-700">{formErrors.retail_price}</span>
						) : null}
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
						{formErrors?.image ? (
							<span class="text-xs text-rose-700">{formErrors.image}</span>
						) : null}
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
