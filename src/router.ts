import { createRouter } from "@remix-run/fetch-router"
import { logger } from "@remix-run/fetch-router/logger-middleware"

import { storeContext } from "./middleware/context"
import { routes } from "./routes"
import { authHandlers } from "./routes/auth"
import { homeHandlers } from "./routes/home"
import { sneakerHandlers } from "./routes/sneakers"

export const router = createRouter()

router.use(storeContext)

if (process.env.NODE_ENV === "development") {
	router.use(logger())
}

router.map(routes.home, homeHandlers)
router.map(routes.sneakers, sneakerHandlers)
router.map(routes.auth, authHandlers)
