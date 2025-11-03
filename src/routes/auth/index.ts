import { type RouteHandlers } from "@remix-run/fetch-router"

import { routes } from "#src/routes.ts"
import { loginHandlers } from "./login"
import { registerHandlers } from "./register"

export const authHandlers = {
	middleware: [],
	handlers: {
		login: loginHandlers,
		register: registerHandlers,
	},
} satisfies RouteHandlers<typeof routes.auth>
