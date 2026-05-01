import type { Controller } from "remix/fetch-router"

import { Document } from "#app/components/document.tsx"
import { render } from "#app/lib/html.tsx"
import { routes } from "#app/routes.ts"
import { getCurrentUserSafely } from "#app/utils/context.ts"
import { redirect } from "remix/response/redirect"

function HomePage() {
	return () => {
		return (
			<Document head={<title>SNKRS Tracker</title>}>
				<div class="min-h-dvh bg-[radial-gradient(85vw_70vw_at_90%_-10%,oklch(0.96_0.03_250/0.55),transparent_55%),radial-gradient(75vw_65vw_at_-10%_10%,oklch(0.96_0.03_175/0.4),transparent_55%),linear-gradient(180deg,oklch(0.99_0.003_260),oklch(0.98_0.006_260))] py-10 text-slate-900 md:py-16">
					<section class="container mx-auto max-w-4xl">
						<div class="rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_20px_55px_oklch(0.2_0.03_250/0.12)] md:p-10">
							<p class="text-xs tracking-widest text-slate-500 uppercase">
								Sneaker collection tracker
							</p>
							<h1 class="mt-2 text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] font-semibold">
								Track what you own, what you sold, and what your pairs cost.
							</h1>
							<p class="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
								Keep your sneaker history in one place with fast filters,
								detailed pair views, and a clean showcase you can share.
							</p>

							<div class="mt-7 flex flex-wrap gap-3">
								<a
									href={routes.auth.login.index.href()}
									class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-slate-800"
								>
									Sign in
								</a>
								<a
									href={routes.auth.register.index.href()}
									class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:border-slate-400 hover:text-slate-900"
								>
									Create account
								</a>
							</div>
						</div>
					</section>
				</div>
			</Document>
		)
	}
}

export const homeHandlers = {
	actions: {
		home() {
			return render(<HomePage />)
		},
		index() {
			let user = getCurrentUserSafely()
			if (user) {
				return redirect(routes.sneakers.index.href())
			}
			return render(<HomePage />)
		},
	},
} satisfies Controller<typeof routes.home>
