import { Document } from "#app/components/document.tsx"
import { SneakerGrid } from "#app/components/sneaker-grid.tsx"
import type { Sneaker } from "#app/db/schema.ts"
import type { SerializedSneaker } from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"

import type { SneakerFormErrors, SneakerFormValues } from "./controller.ts"
import { SneakerForm } from "./sneaker-form-view.tsx"

export function renderSneakersIndexView({
	username,
	sneakers,
}: {
	username: string
	sneakers: ReadonlyArray<SerializedSneaker>
}) {
	return (
		<Document head={<title>Your Sneakers</title>}>
			<div>
				<h1>Welcome, {username}!</h1>
				<div class="mt-4">
					<SneakerGrid username={username} sneakers={sneakers} />
				</div>
			</div>
		</Document>
	)
}

export function renderSneakerNewView({
	formErrors,
	formValues,
}: {
	formErrors?: SneakerFormErrors
	formValues?: SneakerFormValues
}) {
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

export function renderSneakerNotFoundView() {
	return (
		<Document head={<title>404 Not Found</title>}>
			<h1>404 Not Found</h1>
			<p>Sorry, the sneaker you are looking for does not exist.</p>
		</Document>
	)
}

export function renderSneakerEditView({
	sneaker,
	formErrors,
	formValues,
}: {
	sneaker: Sneaker
	formErrors?: SneakerFormErrors
	formValues?: SneakerFormValues
}) {
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
