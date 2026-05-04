import { Document } from "#app/components/document.tsx"
import { routes } from "#app/routes.ts"

import type {
	SneakerFormErrors,
	SneakerFormValues,
} from "./sneaker-form-types.ts"
import { SneakerForm } from "./sneaker-form-view.tsx"

export function SneakerNewView() {
	return ({
		formErrors,
		formValues,
	}: {
		formErrors?: SneakerFormErrors
		formValues?: SneakerFormValues
	}) => {
		return (
			<Document head={<title>Add a new sneaker to your collection</title>}>
				<SneakerForm
					isEditing={false}
					action={routes.sneakers.create.href()}
					formErrors={formErrors}
					formValues={formValues}
				/>
			</Document>
		)
	}
}
