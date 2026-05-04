import { RestfulForm } from "#app/components/restful-form.tsx"
import { routes } from "#app/routes.ts"

export type RegisterValues = {
	email?: string
	username?: string
	given_name?: string
	family_name?: string
}

export type RegisterErrors = {
	email?: string
	username?: string
	password?: string
	confirm_password?: string
	given_name?: string
	family_name?: string
	general?: string
}

export function RegisterPage() {
	return ({
		formValues,
		formErrors,
	}: {
		formValues: RegisterValues | undefined
		formErrors: RegisterErrors | undefined
	}) => {
		return (
			<div class="mx-auto mt-12 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_oklch(0.2_0.03_250/0.08)]">
				<h1 class="text-2xl font-semibold text-slate-900">Create account</h1>
				<p class="mt-1 text-sm text-slate-600">
					Set up your profile to start tracking your collection.
				</p>

				{typeof formErrors?.general === "string" ? (
					<div class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
						{formErrors.general}
					</div>
				) : null}

				<RestfulForm
					method="post"
					action={routes.auth.register.action.href()}
					class="mt-5 grid gap-4 md:grid-cols-2"
				>
					<label class="grid gap-1.5 text-sm text-slate-700" for="given_name">
						First name
						<input
							id="given_name"
							name="given_name"
							type="text"
							autoComplete="given-name"
							required
							defaultValue={formValues?.given_name ?? ""}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.given_name ? (
							<span class="text-xs text-rose-700">{formErrors.given_name}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="family_name">
						Last name
						<input
							id="family_name"
							name="family_name"
							type="text"
							autoComplete="family-name"
							required
							defaultValue={formValues?.family_name ?? ""}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.family_name ? (
							<span class="text-xs text-rose-700">
								{formErrors.family_name}
							</span>
						) : null}
					</label>

					<label
						class="grid gap-1.5 text-sm text-slate-700 md:col-span-2"
						for="email"
					>
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

					<label
						class="grid gap-1.5 text-sm text-slate-700 md:col-span-2"
						for="username"
					>
						Username
						<input
							id="username"
							name="username"
							type="text"
							autoComplete="username"
							required
							defaultValue={formValues?.username ?? ""}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.username ? (
							<span class="text-xs text-rose-700">{formErrors.username}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="password">
						Password
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.password ? (
							<span class="text-xs text-rose-700">{formErrors.password}</span>
						) : null}
					</label>

					<label
						class="grid gap-1.5 text-sm text-slate-700"
						for="confirm_password"
					>
						Confirm password
						<input
							id="confirm_password"
							name="confirm_password"
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.confirm_password ? (
							<span class="text-xs text-rose-700">
								{formErrors.confirm_password}
							</span>
						) : null}
					</label>

					<div class="md:col-span-2">
						<button
							type="submit"
							class="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
						>
							Create account
						</button>
					</div>
				</RestfulForm>

				<p class="mt-4 text-sm text-slate-600">
					Already have an account?{" "}
					<a
						href={routes.auth.login.index.href()}
						class="font-medium text-blue-700 no-underline hover:underline"
					>
						Sign in
					</a>
				</p>
			</div>
		)
	}
}
