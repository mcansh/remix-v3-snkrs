import type { Controller } from "remix/fetch-router"

import { Counter } from "#app/components/counter.tsx"
import { Document } from "#app/components/document.tsx"
import { render } from "#app/lib/html.tsx"
import { routes } from "#app/routes.ts"
import { getCurrentUserSafely } from "#app/utils/context.ts"
import { redirect } from "remix/response/redirect"

function HomePage() {
	return () => {
		return (
			<Document head={<title>Hello, World!</title>}>
				<h1>Hello, World!</h1>
				<Counter />
			</Document>
		)
	}
}

export const homeHandlers = {
	actions: {
		home() {
			return render(<HomePage />)
		},
		index() {
			let user = getCurrentUserSafely()
			if (user) {
				return redirect(routes.sneakers.index.href())
			}
			return render(<HomePage />)
		},
	},
} satisfies Controller<typeof routes.home>
