import type { Controller } from "remix/fetch-router"

import type { routes } from "#app/routes.ts"

import { login } from "./login/controller.ts"
import { logout } from "./logout/controller.ts"
import { register } from "./register/controller.ts"

export const authHandlers = {
	middleware: [],
	actions: {
		login,
		register,
		logout,
	},
} satisfies Controller<typeof routes.auth>
