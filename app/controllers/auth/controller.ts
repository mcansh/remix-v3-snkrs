import type { Controller } from "remix/fetch-router"

import { routes } from "#app/routes.ts"
import { loginHandlers } from "./login/controller"
import { registerHandlers } from "./register/controller"

export const authHandlers = {
	middleware: [],
	actions: {
		login: loginHandlers,
		register: registerHandlers,
	},
} satisfies Controller<typeof routes.auth>
