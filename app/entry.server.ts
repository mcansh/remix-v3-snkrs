import {
	createSecureHeaders,
	mergeHeaders,
	NONE,
	SELF,
} from "@mcansh/http-helmet"

import { env } from "./env.ts"
import { router } from "./router.ts"
import { reportHandlerErrors } from "./sentry.ts"

const securityHeaders = createSecureHeaders({
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

const handler = {
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

export default reportHandlerErrors(handler)

if (import.meta.hot) {
	import.meta.hot.accept()
}
