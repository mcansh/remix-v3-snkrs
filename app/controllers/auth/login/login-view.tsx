import { Document } from "#app/components/document.tsx"

import type { LoginFormErrors, LoginFormValues } from "./page.tsx"
import { LoginPage } from "./page.tsx"

export function LoginView() {
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
			<Document head={<title>Sign In</title>}>
				<LoginPage
					returnTo={returnTo}
					formErrors={formErrors}
					formValues={formValues}
				/>
			</Document>
		)
	}
}
