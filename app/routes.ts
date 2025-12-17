import { form, resources, route } from "@remix-run/fetch-router"

export const routes = route({
	assets: "/assets/*path",
	healthcheck: "/healthcheck",

	home: "/",

	auth: {
		login: form("/login"),
		register: form("/register"),
		logout: form("/logout"),
	},

	sneakers: {
		...resources("/sneakers"),
		user: { method: "GET", pattern: "/:user" },
	},
})
