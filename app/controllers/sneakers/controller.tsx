import * as s from "remix/data-schema"
import type { BuildAction, Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

import { render } from "#app/lib/html.tsx"
import { requireAuth } from "#app/middleware/auth.ts"
import {
	deleteSneaker,
	getAllUserSneakers,
	getSneakerById,
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

const sneakerIndexHandler = {
	middleware: [requireAuth],
	async handler() {
		let user = getCurrentUser()
		let sneakers = await getAllUserSneakers(user.id)

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
		let session = get(Session)
		session.flash("formErrors", {
			general: "Sneaker creation is not yet implemented",
		} satisfies SneakerFormErrors)
		return redirect(routes.sneakers.index.href())
	},
} satisfies BuildAction<"POST", typeof routes.sneakers.create>

const sneakerDestroyHandler = {
	middleware: [requireAuth],
	async handler({ get, params }) {
		let user = getCurrentUser()
		let session = get(Session)

		let destroySchema = s.object({ id: s.string().pipe(isCuid2()) })
		let result = s.parse(destroySchema, params)

		let deleted = await deleteSneaker(result.id, user.id)

		if (!deleted) {
			session.flash("formErrors", {
				general: "failed to delete sneaker",
			} satisfies SneakerFormErrors)
			return redirect(routes.sneakers.index.href())
		}

		session.flash("formErrors", {
			general: "sneaker deleted successfully",
		} satisfies SneakerFormErrors)
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
	async handler({ get }) {
		let session = get(Session)

		session.flash("formErrors", {
			general: "Sneaker update is not yet implemented",
		} satisfies SneakerFormErrors)

		return redirect(routes.sneakers.index.href())
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
