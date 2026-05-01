import type { Controller } from "remix/fetch-router"
import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

import { Document } from "#app/components/document.tsx"
import { render } from "#app/lib/html.tsx"
import { requireAuth } from "#app/middleware/auth.ts"
import { routes } from "#app/routes.ts"

export const logout = {
	middleware: [requireAuth],
		actions: {
			async action(context) {
				let session = context.get(Session)
				session.destroy()
				return redirect(routes.home.index.href())
			},

			index({ get }) {
				let session = get(Session)
				let error = session.get("error")

				return render(
					<Document head={<title>Sign Out</title>}>
						{typeof error === "string" ? (
							<div class="mx-auto mt-8 w-full max-w-md rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
								{error}
							</div>
						) : null}

						<div class="mx-auto mt-12 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_oklch(0.2_0.03_250/0.08)]">
							<h1 class="text-2xl font-semibold text-slate-900">Sign out</h1>
							<p class="mt-1 text-sm text-slate-600">
								You are about to end your current session.
							</p>

							<form
								method="post"
								action={routes.auth.logout.action.href()}
								class="mt-5 grid gap-2"
							>
								<button
									type="submit"
									class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
								>
									Sign out
								</button>
								<a
									href={routes.sneakers.index.href()}
									class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:border-slate-400 hover:text-slate-900"
								>
									Cancel
								</a>
							</form>
						</div>
					</Document>,
				)
			},
	},
} satisfies Controller<typeof routes.auth.logout>
