import { asyncContext } from "remix/async-context-middleware"
import { createRouter, type Middleware } from "remix/fetch-router"
import { formData } from "remix/form-data-middleware"
import { logger } from "remix/logger-middleware"
import { methodOverride } from "remix/method-override-middleware"
import { session } from "remix/session-middleware"

import { authHandlers } from "./controllers/auth/controller.ts"
import { brandHandlers } from "./controllers/brands/controller.tsx"
import { homeHandlers } from "./controllers/home/controller.tsx"
import { sneakerHandlers } from "./controllers/sneakers/controller.tsx"
import { uploadHandler } from "./lib/upload.ts"
import { routes } from "./routes"
import { sessionCookie, sessionStorage } from "./utils/session.ts"

let middleware = [
	import.meta.env.DEV ? logger() : null,
	formData({ maxFiles: 1, uploadHandler }),
	methodOverride(),
	session(sessionCookie, sessionStorage),
	asyncContext(),
].filter((m): m is Middleware => !!m)

export const router = createRouter({ middleware })

router.map(routes.home, homeHandlers)
router.map(routes.sneakers, sneakerHandlers)
router.map(routes.brands, brandHandlers)
router.map(routes.auth, authHandlers)
