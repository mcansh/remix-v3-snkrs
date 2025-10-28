import { type RouteHandlers } from "@remix-run/fetch-router"

import { routes } from "../routes"
import { loginHandlers } from "./auth.login"
import { registerHandlers } from "./auth.register"

export const authHandlers = {
	use: [],
	handlers: {
		login: loginHandlers,
		register: registerHandlers,
	},
} satisfies RouteHandlers<typeof routes.auth>
