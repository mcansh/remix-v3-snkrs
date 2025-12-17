import { form, resources, route, get } from "@remix-run/fetch-router"

export const routes = route({
	assets: get("/assets/*path"),
	healthcheck: get("/healthcheck"),

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
