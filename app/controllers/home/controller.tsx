import type { Controller } from "remix/fetch-router"

import { Counter } from "#app/components/counter.tsx"
import { Document } from "#app/components/document.tsx"
import { render } from "#app/lib/html.tsx"
import { routes } from "#app/routes.ts"

export const homeHandlers = {
	actions: {
		index() {
			return render(
				<Document head={<title>Hello, World!</title>}>
					<h1>Hello, World!</h1>
					<Counter />
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.home>
