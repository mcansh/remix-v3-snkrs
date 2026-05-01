import type { Controller } from "remix/fetch-router"

import { routes } from "#app/routes.ts"
import { login } from "./login/controller"
import { logout } from "./logout/controller"
import { register } from "./register/controller"

export const authHandlers = {
	middleware: [],
	actions: {
		login,
		register,
		logout,
	},
} satisfies Controller<typeof routes.auth>
