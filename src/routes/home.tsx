import type { Controller } from "@remix-run/fetch-router"

import { Counter } from "#src/components/counter.tsx"
import { renderDocument } from "#src/lib/html.tsx"
import { routes } from "#src/routes.ts"

export const homeHandlers = {
	index() {
		return renderDocument(
			<>
				<title>Hello, World!</title>
				<h1>Hello, World!</h1>
				<Counter />
			</>,
		)
	},
} satisfies Controller<typeof routes.home>
