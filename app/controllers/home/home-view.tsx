import { Document } from "#app/components/document.tsx"

import { HomePage } from "./page.tsx"

export function renderHomeView() {
	return (
		<Document head={<title>SNKRS Tracker</title>}>
			<HomePage />
		</Document>
	)
}
