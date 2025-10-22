import { createRouter } from "@remix-run/fetch-router"

import { routes } from "./routes"
import { authHandlers } from "./routes/auth"
import { homeHandlers } from "./routes/home"
import { sneakerHandlers } from "./routes/sneakers"

export const router = createRouter()

router.map(routes.home, homeHandlers)
router.map(routes.sneakers, sneakerHandlers)
router.map(routes.auth, authHandlers)
