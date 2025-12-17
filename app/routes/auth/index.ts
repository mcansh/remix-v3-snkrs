import type { Controller } from "@remix-run/fetch-router"

import { routes } from "#app/routes.js"
import { loginHandlers } from "./login.js"
import { registerHandlers } from "./register.js"
import { logoutHandlers } from "./logout.js"

export const authHandlers = {
	middleware: [],
	actions: {
		login: loginHandlers,
		register: registerHandlers,
		logout: logoutHandlers,
	},
} satisfies Controller<typeof routes.auth>
