import { asyncContext } from "@remix-run/async-context-middleware"
import { createRouter, type Middleware } from "@remix-run/fetch-router"
import { formData } from "@remix-run/form-data-middleware"
import { logger } from "@remix-run/logger-middleware"
import { methodOverride } from "@remix-run/method-override-middleware"
import { session } from "@remix-run/session-middleware"

import { uploadHandler } from "./lib/upload.ts"
import { routes } from "./routes"
import { authHandlers } from "./routes/auth/index.ts"
import { brandHandlers } from "./routes/brands.tsx"
import { commonFileHandlers } from "./routes/common-files.ts"
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

router.map(routes.commonFiles, commonFileHandlers)
router.map(routes.home, homeHandlers)
router.map(routes.sneakers, sneakerHandlers)
router.map(routes.brands, brandHandlers)
router.map(routes.auth, authHandlers)
