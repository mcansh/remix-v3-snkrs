import { RestfulForm } from "#app/components/restful-form.tsx"
import { routes } from "#app/routes.ts"

export type LoginFormValues = {
	email?: string
}

export type LoginFormErrors = {
	email?: string
	password?: string
	general?: string
}

export function LoginPage() {
	return ({
		returnTo,
		formErrors,
		formValues,
	}: {
		returnTo?: string | null
		formErrors?: LoginFormErrors
		formValues?: LoginFormValues
	}) => {
		return (
			<div class="mx-auto mt-12 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_oklch(0.2_0.03_250/0.08)]">
				<h1 class="text-2xl font-semibold text-slate-900">Sign in</h1>
				<p class="mt-1 text-sm text-slate-600">
					Welcome back. Enter your credentials to continue.
				</p>

				{typeof formErrors?.general === "string" ? (
					<div class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
						{formErrors.general}
					</div>
				) : null}

				<RestfulForm
					method="post"
					action={routes.auth.login.action.href()}
					class="mt-5 grid gap-4"
				>
					{returnTo ? (
						<input type="hidden" name="return_to" value={returnTo} />
					) : null}

					<label class="grid gap-1.5 text-sm text-slate-700" for="email">
						Email
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							defaultValue={formValues?.email ?? ""}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.email ? (
							<span class="text-xs text-rose-700">{formErrors.email}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="password">
						Password
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.password ? (
							<span class="text-xs text-rose-700">{formErrors.password}</span>
						) : null}
					</label>

					<button
						type="submit"
						class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
					>
						Sign in
					</button>
				</RestfulForm>

				<p class="mt-4 text-sm text-slate-600">
					Need an account?{" "}
					<a
						href={routes.auth.register.index.href()}
						class="font-medium text-blue-700 no-underline hover:underline"
					>
						Create one
					</a>
				</p>
			</div>
		)
	}
}
