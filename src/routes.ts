import { formAction, resources, route } from "@remix-run/fetch-router"

export const routes = route({
	home: { index: "/" },
	auth: {
		login: formAction("/login"),
		register: formAction("/register"),
	},
	sneakers: {
		...resources("/sneakers"),
		user: { method: "GET", pattern: "/:user/sneakers" },
	},
})

console.log({ routes: routes.sneakers.user })
