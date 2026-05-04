import { routes } from "#app/routes.ts"

export function LogoutPage() {
	return ({ error }: { error?: string }) => {
		return (
			<>
				{error ? (
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
			</>
		)
	}
}
