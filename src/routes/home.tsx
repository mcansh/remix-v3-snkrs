import type { RouteHandlers } from "@remix-run/fetch-router"

import { Counter } from "../components/counter"
import { Document } from "../components/document"
import { render } from "../lib/html"
import { routes } from "../routes"

export const homeHandlers = {
	index() {
		return render(
			<Document>
				<title>Hello, World!</title>
				<h1>Hello, World!</h1>
				<Counter />
			</Document>,
		)
	},
} satisfies RouteHandlers<typeof routes.home>
