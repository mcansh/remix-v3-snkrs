import { createRouter } from "@remix-run/fetch-router"
import { logger } from "@remix-run/fetch-router/logger-middleware"

import { storeContext } from "./middleware/context"
import { routes } from "./routes"
import { authHandlers } from "./routes/auth/index.ts"
import { homeHandlers } from "./routes/home.tsx"
import { sneakerHandlers } from "./routes/sneakers.tsx"

export const router = createRouter()

router.use(storeContext)

if (process.env.NODE_ENV === "development") {
	router.use(logger())
}

router.map(routes.home, homeHandlers)
router.map(routes.sneakers, sneakerHandlers)
router.map(routes.auth, authHandlers)
