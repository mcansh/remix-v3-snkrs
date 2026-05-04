import { completeAuth } from "remix/auth"
import * as s from "remix/data-schema"
import { email } from "remix/data-schema/checks"
import * as f from "remix/data-schema/form-data"
import type { Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

import { render } from "#app/lib/html.tsx"
import { getPostAuthRedirect } from "#app/middleware/auth.ts"
import { authenticateUser } from "#app/models/user.ts"
import { routes } from "#app/routes.ts"
import { getCurrentUserSafely } from "#app/utils/context.ts"

import type { LoginFormErrors, LoginFormValues } from "./page.tsx"
import { renderLoginView } from "./login-view.tsx"

const loginSchema = f.object({
	email: f.field(s.string().pipe(email())),
	password: f.field(s.string()),
	return_to: f.field(s.optional(s.string())),
})

function getFieldErrors(issues: unknown): LoginFormErrors {
	if (!Array.isArray(issues)) return { general: "Please check your inputs." }

	let errors: LoginFormErrors = {}

	for (let issue of issues) {
		if (typeof issue !== "object" || issue === null) continue

		let path = "path" in issue ? (issue.path as unknown) : null
		let message = "message" in issue ? issue.message : null
		let field = Array.isArray(path) ? path.at(0) : null

		if (typeof field === "string" && typeof message === "string") {
			if (field === "email" || field === "password") {
				errors[field] = message
			}
		}
	}

	if (!errors.email && !errors.password) {
		errors.general = "Please check your inputs."
	}

	return errors
}

export const login = {
	middleware: [],
	actions: {
		async action(context) {
			let formData = context.get(FormData)
			let session = context.get(Session)
			let returnToFromForm = formData.get("return_to")
			let returnTo =
				typeof returnToFromForm === "string" && returnToFromForm.length > 0
					? returnToFromForm
					: routes.home.index.href()
			let emailValue = formData.get("email")
			let values: LoginFormValues = {
				email: typeof emailValue === "string" ? emailValue : "",
			}

			let result = s.parseSafe(loginSchema, formData)

			if (result.success === false) {
				session.flash("formErrors", getFieldErrors(result.issues))
				session.flash("formValues", values)
				return redirect(routes.auth.login.index.href(undefined, { returnTo }))
			}

			let user = await authenticateUser(
				result.value.email,
				result.value.password,
			)
			returnTo = result.value.return_to || routes.home.index.href()

			if (user == null) {
				session.flash("formErrors", {
					password: "Invalid email or password. Please try again.",
				} satisfies LoginFormErrors)
				session.flash("formValues", values)
				return redirect(routes.auth.login.index.href(undefined, { returnTo }))
			}

			let authSession = completeAuth(context)
			authSession.set("auth", { userId: user.id })

			return redirect(getPostAuthRedirect(context.url))
		},

		async index({ get, url }) {
			let session = get(Session)
			let returnTo = url.searchParams.get("returnTo")
			let formErrors = session.get("formErrors") as LoginFormErrors | undefined
			let formValues = session.get("formValues") as LoginFormValues | undefined

			let user = getCurrentUserSafely()

			if (user) {
				return redirect(routes.home.index.href())
			}

			return render(
				renderLoginView({
					returnTo,
					formErrors,
					formValues,
				}),
			)
		},
	},
} satisfies Controller<typeof routes.auth.login>
