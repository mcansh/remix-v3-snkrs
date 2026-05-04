import { decode } from "decode-formdata"
import * as s from "remix/data-schema"
import { email, minLength } from "remix/data-schema/checks"
import * as f from "remix/data-schema/form-data"
import type { Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

import { render } from "#app/lib/html.tsx"
import { createUser, getUserByEmail } from "#app/models/user.ts"
import { routes } from "#app/routes.ts"

import { type RegisterErrors, type RegisterValues } from "./page.tsx"
import { RegisterView } from "./register-view.tsx"

const registerSchema = f.object({
	email: f.field(s.string().pipe(email())),
	username: f.field(s.string()),
	password: f.field(s.string().pipe(minLength(8))),
	confirm_password: f.field(s.string().pipe(minLength(8))),
	given_name: f.field(s.string()),
	family_name: f.field(s.string()),
})

function getRegisterFieldErrors(issues: unknown): RegisterErrors {
	if (!Array.isArray(issues)) return { general: "Please check your inputs." }

	let errors: RegisterErrors = {}

	for (let issue of issues) {
		if (typeof issue !== "object" || issue === null) continue

		let path = "path" in issue ? (issue.path as unknown) : null
		let message = "message" in issue ? issue.message : null
		let field = Array.isArray(path) ? path.at(0) : null

		if (typeof field === "string" && typeof message === "string") {
			if (
				field === "email" ||
				field === "username" ||
				field === "password" ||
				field === "confirm_password" ||
				field === "given_name" ||
				field === "family_name"
			) {
				errors[field] = message
			}
		}
	}

	if (
		!errors.email &&
		!errors.username &&
		!errors.password &&
		!errors.confirm_password &&
		!errors.given_name &&
		!errors.family_name
	) {
		errors.general = "Please check your inputs."
	}

	return errors
}

export const register = {
	actions: {
		async action({ get }) {
			let session = get(Session)
			let formData = get(FormData)
			let values: RegisterValues = {
				email:
					typeof formData.get("email") === "string"
						? String(formData.get("email"))
						: "",
				username:
					typeof formData.get("username") === "string"
						? String(formData.get("username"))
						: "",
				given_name:
					typeof formData.get("given_name") === "string"
						? String(formData.get("given_name"))
						: "",
				family_name:
					typeof formData.get("family_name") === "string"
						? String(formData.get("family_name"))
						: "",
			}

			let decoded = decode(formData)

			let result = s.parseSafe(registerSchema, decoded)

			if (result.success === false) {
				session.flash("formErrors", getRegisterFieldErrors(result.issues))
				session.flash("formValues", values)
				return redirect(routes.auth.register.index.href())
			}

			// Check if user already exists
			if (await getUserByEmail(result.value.email)) {
				session.flash("formErrors", {
					email: "An account with this email already exists.",
				} satisfies RegisterErrors)
				session.flash("formValues", values)
				return redirect(routes.auth.register.index.href())
			}

			if (result.value.password !== result.value.confirm_password) {
				session.flash("formErrors", {
					confirm_password: "Passwords do not match.",
				} satisfies RegisterErrors)
				session.flash("formValues", values)
				return redirect(routes.auth.register.index.href())
			}

			let createdUser = await createUser({
				email: result.value.email,
				family_name: result.value.family_name,
				given_name: result.value.given_name,
				password: result.value.password,
				username: result.value.username,
			})

			if (!createdUser) {
				session.flash("formErrors", {
					general: "Failed to create account. Please try again.",
				} satisfies RegisterErrors)
				session.flash("formValues", values)
				return redirect(routes.auth.register.index.href())
			}

			session.set("auth", { userId: createdUser.id })

			return redirect(
				routes.showcase.user.href({ username: createdUser.username }),
			)
		},
		index({ get }) {
			let session = get(Session)
			let formErrors = session.get("formErrors") as RegisterErrors | undefined
			let formValues = session.get("formValues") as RegisterValues | undefined

			return render(
				<RegisterView formValues={formValues} formErrors={formErrors} />,
			)
		},
	},
} satisfies Controller<typeof routes.auth.register>
