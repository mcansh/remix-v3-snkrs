import { form, resources, route } from "remix/fetch-router/routes"

export const routes = route({
	home: {
		index: "/",
		home: "/home",
	},
	auth: {
		login: form("/login"),
		register: form("/register"),
		logout: form("/logout"),
	},
	sneakers: resources("/sneakers", {
		exclude: ["show"],
	}),
	showcase: {
		user: { method: "GET", pattern: "/:username/sneakers" },
		owned: { method: "GET", pattern: "/:username/sneakers/owned" },
		sold: { method: "GET", pattern: "/:username/sneakers/sold" },
		show: { method: "GET", pattern: "/:username/sneakers/:sneakerId" },
	},
	brands: resources("/brands", {
		param: "brand",
		only: ["index", "show"],
	}),
})
