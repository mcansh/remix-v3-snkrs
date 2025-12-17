import type { Controller } from "@remix-run/fetch-router"
import { createRedirectResponse } from "@remix-run/response/redirect"

import { Document } from "#app/components/document.js"
import { RestfulForm } from "#app/components/restful-form.js"
import { render } from "#app/lib/html.js"
import { routes } from "#app/routes.js"
import { getCurrentUserSafely } from "#app/utils/context.js"
import { loadAuth } from "#app/middleware/auth.js"
import { Button } from "#app/components/ui/button.js"

export const logoutHandlers = {
	middleware: [loadAuth()],
	actions: {
		async action({ session }) {
			session.destroy()
			return createRedirectResponse(routes.home.href())
		},

		async index() {
			let user = getCurrentUserSafely()

			if (!user) return createRedirectResponse(routes.home.href())

			return render(
				<Document bodyClassName="bg-slate-400">
					<div class="flex min-h-full flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
						<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
							<div class="rounded-lg bg-white px-4 py-8 shadow sm:px-10">
								<RestfulForm
									method="post"
									action={routes.auth.logout.action.href()}
								>
									<fieldset>
										<Button type="submit" class="btn btn-primary w-full">
											Logout {user.username}
										</Button>
									</fieldset>
								</RestfulForm>
							</div>
						</div>
					</div>
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.auth.logout>
