import { Document } from "#app/components/document.tsx"
import type { SneakerWithBrand } from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"

import type {
	SneakerFormErrors,
	SneakerFormValues,
} from "./sneaker-form-types.ts"
import { SneakerForm } from "./sneaker-form-view.tsx"

export function SneakerEditView() {
	return ({
		sneaker,
		formErrors,
		formValues,
	}: {
		sneaker: SneakerWithBrand
		formErrors?: SneakerFormErrors
		formValues?: SneakerFormValues
	}) => {
		return (
			<Document head={<title>Edit Sneaker</title>}>
				<SneakerForm
					sneaker={sneaker}
					isEditing={true}
					action={routes.sneakers.update.href({ id: sneaker.id })}
					formErrors={formErrors}
					formValues={formValues}
				/>
			</Document>
		)
	}
}
