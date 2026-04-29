import {
	createSecureHeaders,
	NONE,
	SELF,
	mergeHeaders,
} from "@mcansh/http-helmet"

import { env } from "./lib/env"
import { router } from "./router"

let securityHeaders = createSecureHeaders({
	"Content-Security-Policy": {
		"default-src": [NONE],
		"connect-src": [SELF, import.meta.env.DEV ? "ws:" : undefined],
		"script-src": [SELF],
		"style-src": [SELF],
		"img-src": [
			SELF,
			`https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/`,
		],
	},
})

export default {
	async fetch(request) {
		let response = await router.fetch(request)
		let headers = mergeHeaders(response.headers, securityHeaders)
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		})
	},
} satisfies ExportedHandler

if (import.meta.hot) {
	import.meta.hot.accept()
}
