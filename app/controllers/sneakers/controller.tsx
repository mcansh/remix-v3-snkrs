import { and, eq } from "drizzle-orm"
import * as s from "remix/data-schema"
import type { BuildAction, Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

import { schema } from "#app/db/index.ts"
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

import { SneakerEditView } from "./sneaker-edit-view.tsx"
import type {
	SneakerFormErrors,
	SneakerFormValues,
} from "./sneaker-form-types.ts"
import { SneakerNewView } from "./sneaker-new-view.tsx"
import { SneakerNotFoundView } from "./sneaker-not-found-view.tsx"
import { SneakersIndexView } from "./sneakers-index-view.tsx"

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
			<SneakersIndexView username={user.username} sneakers={sneakers} />,
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
			<SneakerNewView formErrors={formErrors} formValues={formValues} />,
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
			return render(<SneakerNotFoundView />, { status: 404 })
		}

		return render(
			<SneakerEditView
				sneaker={sneaker}
				formErrors={session.get("formErrors") as SneakerFormErrors | undefined}
				formValues={session.get("formValues") as SneakerFormValues | undefined}
			/>,
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
