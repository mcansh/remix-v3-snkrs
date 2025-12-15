import { routes } from "#app/routes.js"
import type { Controller } from "@remix-run/fetch-router"

import { loginHandlers } from "./login.js"
import { registerHandlers } from "./register.js"

export const authHandlers = {
	middleware: [],
	actions: {
		login: loginHandlers,
		register: registerHandlers,
	},
} satisfies Controller<typeof routes.auth>
