import { asyncContext } from "@remix-run/async-context-middleware"
import { compression } from "@remix-run/compression-middleware"
import { createRouter, type Middleware } from "@remix-run/fetch-router"
import { formData } from "@remix-run/form-data-middleware"
import { logger } from "@remix-run/logger-middleware"
import { methodOverride } from "@remix-run/method-override-middleware"
import { session } from "@remix-run/session-middleware"
import { staticFiles } from "@remix-run/static-middleware"

import { uploadHandler } from "./lib/upload.js"
import { routes } from "./routes.js"
import { authHandlers } from "./routes/auth/index.js"
import { healthcheckHandlers } from "./routes/healthcheck.js"
import { homeHandlers } from "./routes/home.js"
import { sneakerHandlers } from "./routes/sneakers.js"
import { sessionCookie, sessionStorage } from "./utils/session.js"

let middleware = [
	process.env.NODE_ENV === "development" ? logger() : null,
	formData({ maxFiles: 1, uploadHandler }),
	methodOverride(),
	session(sessionCookie, sessionStorage),
	asyncContext(),
	staticFiles("./public", {
		cacheControl: "no-store, must-revalidate",
		etag: false,
		lastModified: false,
	}),
	compression(),
].filter((m): m is Middleware => !!m)

export const router = createRouter({ middleware })

router.map(routes.home, homeHandlers)
router.map(routes.auth, authHandlers)
router.map(routes.sneakers, sneakerHandlers)
router.map(routes.healthcheck, healthcheckHandlers)
