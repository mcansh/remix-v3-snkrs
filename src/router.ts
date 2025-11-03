import { createRouter } from "@remix-run/fetch-router"
import { logger } from "@remix-run/fetch-router/logger-middleware"
import { methodOverride } from "@remix-run/fetch-router/method-override-middleware"

import { storeContext } from "./middleware/context"
import { routes } from "./routes"
import { authHandlers } from "./routes/auth/index.ts"
import { homeHandlers } from "./routes/home.tsx"
import { sneakerHandlers } from "./routes/sneakers.tsx"

let middleware = []

if (process.env.NODE_ENV === "development") {
	middleware.push(logger())
}

middleware.push(storeContext())
middleware.push(methodOverride())

export const router = createRouter({})

router.map(routes.home, homeHandlers)
router.map(routes.sneakers, sneakerHandlers)
router.map(routes.auth, authHandlers)
