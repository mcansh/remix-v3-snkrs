import { Counter } from "#app/assets/counter.js"
import { renderDocument } from "#app/lib/html.js"
import { routes } from "#app/routes.js"
import type { BuildAction } from "@remix-run/fetch-router"

export const homeHandlers = {
	middleware: [],
	action() {
		return renderDocument(
			<>
				<title>Hello, World!</title>
				<h1>Hello, World!</h1>
				<Counter />
			</>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.home>
