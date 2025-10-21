import { resources, route } from "@remix-run/fetch-router"

export const routes = route({
	home: { index: "/" },
	sneakers: resources("/sneakers"),
})
