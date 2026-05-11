import type { Controller } from "remix/fetch-router"

import type { routes } from "#app/routes.ts"

import { sneakerUserShowHandler } from "./show/controller.tsx"
import { sneakerUserHandler } from "./user/controller.tsx"

export const showcaseHandlers = {
	actions: {
		user: sneakerUserHandler,
		// owned: sneakerUserOwnedHandler,
		// sold: sneakerUserHandler,
		show: sneakerUserShowHandler,
	},
} satisfies Controller<typeof routes.showcase>
