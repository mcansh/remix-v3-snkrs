import type { Controller } from "remix/fetch-router"

import { Counter } from "#src/components/counter.tsx"
import { Document } from "#src/components/document.tsx"
import { render } from "#src/lib/html.tsx"
import { routes } from "#src/routes.ts"

export const homeHandlers = {
	actions: {
		index() {
			return render(
				<Document>
					<title>Hello, World!</title>
					<h1>Hello, World!</h1>
					<Counter />
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.home>
