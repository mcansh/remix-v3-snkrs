import { asyncContext } from "remix/async-context-middleware"
import { createRouter, type Middleware } from "remix/fetch-router"
import { formData } from "remix/form-data-middleware"
import { logger } from "remix/logger-middleware"
import { methodOverride } from "remix/method-override-middleware"
import { session } from "remix/session-middleware"

import { uploadHandler } from "./lib/upload.ts"
import { routes } from "./routes"
import { authHandlers } from "./routes/auth/index.ts"
import { brandHandlers } from "./routes/brands.tsx"
import { homeHandlers } from "./routes/home.tsx"
import { sneakerHandlers } from "./routes/sneakers.tsx"
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
