import type { Controller } from "@remix-run/fetch-router"

import { routes } from "#src/routes.ts"
import { loginHandlers } from "./login"
import { registerHandlers } from "./register"

export const authHandlers = {
	middleware: [],
	actions: {
		login: loginHandlers,
		register: registerHandlers,
	},
} satisfies Controller<typeof routes.auth>
