import { Document } from "#app/components/document.js"
import { RestfulForm } from "#app/components/restful-form.js"
import { render } from "#app/lib/html.js"
import { authenticateUser } from "#app/models/user.js"
import { routes } from "#app/routes.js"
import type { Controller } from "@remix-run/fetch-router"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { decode } from "decode-formdata"
import * as z from "zod/mini"

const inputs = [
	{
		name: "email",
		label: "Email Address",
		type: "email",
		autoComplete: "email",
	},
	{
		name: "password",
		label: "Password",
		type: "password",
		autoComplete: "new-password",
	},
] as const

export const loginHandlers = {
	middleware: [],
	actions: {
		async action({ formData, session }) {
			let loginSchema = z.object({
				email: z.email(),
				password: z.string(),
				return_to: z.optional(z.string()),
			})

			let decoded = decode(formData)

			let result = loginSchema.safeParse(decoded)

			if (!result.success) {
				console.error(result.error)
				return createRedirectResponse(routes.auth.login.index.href())
			}

			let user = await authenticateUser(result.data.email, result.data.password)
			let returnTo = result.data.return_to || routes.home.href()

			if (!user) {
				session.flash("error", "Invalid email or password. Please try again.")
				return createRedirectResponse(routes.auth.login.index.href(undefined, { returnTo }))
			}

			session.set("userId", user.id)

			// if (!user) {
			// 	return render(
			// 		<Document>
			// 			<div class="card" style="max-width: 500px; margin: 2rem auto;">
			// 				<div class="alert alert-error">
			// 					Invalid email or password. Please try again.
			// 				</div>
			// 				<p>
			// 					<a href={routes.auth.login.index.href()} class="btn">
			// 						Back to Login
			// 					</a>
			// 				</p>
			// 			</div>
			// 		</Document>,
			// 		{ status: 401 },
			// 	)
			// }

			return createRedirectResponse(returnTo)
		},

		async index({ url, session }) {
			let returnTo = url.searchParams.get("returnTo")
			let error = session.get("error")

			return render(
				<Document>
					{typeof error === "string" ? (
						<div class="alert alert-error" style="margin-bottom: 1.5rem;">
							{error}
						</div>
					) : null}

					<div class="flex min-h-full flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
						<div class="sm:mx-auto sm:w-full sm:max-w-md">
							<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
								Join now and start showing off your collection
							</h2>
						</div>

						<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
							<div class="rounded-lg bg-white px-4 py-8 shadow sm:px-10">
								<RestfulForm method="post" action={routes.auth.register.index.href()}>
									<fieldset class="space-y-6">
										{returnTo ? <input type="hidden" name="return_to" value={returnTo} /> : null}
										{inputs.map((input) => {
											let error = null

											return (
												<div key={input.name}>
													<label htmlFor="email" class="block text-sm font-medium text-gray-700">
														{input.label}
													</label>
													<div class="mt-1">
														<input
															id={input.name}
															name={input.name}
															type={input.type}
															autoComplete={input.autoComplete}
															class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none aria-invalid:border-red-300 aria-invalid:text-red-900 aria-invalid:placeholder-red-300 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-500 sm:text-sm"
															aria-invalid={error ? "true" : undefined}
															aria-errormessage={error ? `${input.name}-error` : undefined}
														/>
														{error ? (
															<div class="mt-2 text-sm text-red-600" id={`${input.name}-error`}>
																<p class="mt-1">{error}</p>
															</div>
														) : null}
													</div>
												</div>
											)
										})}

										<div class="flex items-center justify-between">
											<div class="text-sm">
												<span class="text-gray-900">Already have an account?</span>
											</div>
											<div class="text-sm">
												<a
													href={routes.auth.login.index.href()}
													class="font-medium text-indigo-600 hover:text-indigo-500"
												>
													Sign in
												</a>
											</div>
										</div>
										<div>
											<button
												type="submit"
												class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
											>
												Join now
											</button>
										</div>
									</fieldset>
								</RestfulForm>
							</div>
						</div>
					</div>
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.auth.login>
