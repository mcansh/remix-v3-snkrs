import { createRouter, type Middleware } from "@remix-run/fetch-router"
import { formData } from "@remix-run/fetch-router/form-data-middleware"
import { logger } from "@remix-run/fetch-router/logger-middleware"
import { methodOverride } from "@remix-run/fetch-router/method-override-middleware"

import { uploadHandler } from "./lib/upload.ts"
import { storeContext } from "./middleware/context"
import { routes } from "./routes"
import { authHandlers } from "./routes/auth/index.ts"
import { homeHandlers } from "./routes/home.tsx"
import { sneakerHandlers } from "./routes/sneakers.tsx"

let middleware = [
	import.meta.env.DEV ? logger() : null,
	formData({ maxFiles: 1, uploadHandler }),
	methodOverride(),
	storeContext(),
].filter((m): m is Middleware => !!m)

export const router = createRouter({ middleware })

router.map(routes.home, homeHandlers)
router.map(routes.sneakers, sneakerHandlers)
router.map(routes.auth, authHandlers)
