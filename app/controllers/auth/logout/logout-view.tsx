import { Document } from "#app/components/document.tsx"

import { LogoutPage } from "./page.tsx"

export function LogoutView() {
	return ({ error }: { error?: string }) => {
		return (
			<Document head={<title>Sign Out</title>}>
				<LogoutPage error={error} />
			</Document>
		)
	}
}
