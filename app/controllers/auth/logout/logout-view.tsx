import { Document } from "#app/components/document.tsx"

import { LogoutPage } from "./page.tsx"

export function renderLogoutView({ error }: { error?: string }) {
	return (
		<Document head={<title>Sign Out</title>}>
			<LogoutPage error={error} />
		</Document>
	)
}
