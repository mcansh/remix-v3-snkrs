import { Document } from "#app/components/document.tsx"

import {
	RegisterPage,
	type RegisterErrors,
	type RegisterValues,
} from "./page.tsx"

export function RegisterView() {
	return ({
		formValues,
		formErrors,
	}: {
		formValues: RegisterValues | undefined
		formErrors: RegisterErrors | undefined
	}) => {
		return (
			<Document head={<title>Create Account</title>}>
				<RegisterPage formValues={formValues} formErrors={formErrors} />
			</Document>
		)
	}
}
