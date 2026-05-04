import { Document } from "#app/components/document.tsx"

import { HomePage } from "./page.tsx"

export function HomeView() {
	return () => {
		return (
			<Document head={<title>SNKRS Tracker</title>}>
				<HomePage />
			</Document>
		)
	}
}
