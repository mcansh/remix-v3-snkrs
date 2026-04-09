import { form, resources, route } from "@remix-run/fetch-router"

export const routes = route({
	home: { index: "/" },
	auth: {
		login: form("/login"),
		register: form("/register"),
	},
	sneakers: {
		...resources("/sneakers"),
		user: { method: "GET", pattern: "/:user/sneakers" },
	},
	brands: resources("/brands", {
		param: "brand",
		only: ["index", "show"],
	}),
	commonFiles: {
		robotsTxt: { method: "GET", pattern: "/robots.txt" },
		sitemapXml: { method: "GET", pattern: "/sitemap.xml" },
		faviconIco: { method: "GET", pattern: "/favicon.ico" },
	},
})
