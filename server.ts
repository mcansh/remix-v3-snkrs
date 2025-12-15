import { env } from "#app/lib/env.js"
import { router } from "#app/router.js"
import { createSecureHeaders, mergeHeaders, NONE, SELF } from "@mcansh/http-helmet"
import { createRequestListener } from "@remix-run/node-fetch-server"
import * as http from "node:http"

let securityHeaders = createSecureHeaders({
	"Content-Security-Policy": {
		"default-src": [NONE],
		"connect-src": [SELF, process.env.NODE_ENV === "development" ? "ws:" : undefined],
		"script-src": [SELF],
		"style-src": [SELF],
		"img-src": [SELF, `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/`],
	},
})

let server = http.createServer(
	createRequestListener(async (request) => {
		try {
			let response = await router.fetch(request)
			mergeHeaders(response.headers, securityHeaders)
			return response
		} catch (error) {
			console.error(error)
			return new Response("Internal Server Error", { status: 500 })
		}
	}),
)

let port = process.env.PORT ? parseInt(process.env.PORT, 10) : 44100

server.listen(port, () => {
	console.log(`✅ application is running on http://localhost:${port}`)
})

let shuttingDown = false

function shutdown() {
	if (shuttingDown) return
	shuttingDown = true
	server.close(() => {
		process.exit(0)
	})
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
