import type { Controller } from "remix/fetch-router"

import type { routes } from "#app/routes.ts"

import { login } from "./login/controller.tsx"
import { logout } from "./logout/controller.tsx"
import { register } from "./register/controller.tsx"

export const authHandlers = {
	middleware: [],
	actions: {
		login,
		register,
		logout,
	},
} satisfies Controller<typeof routes.auth>
