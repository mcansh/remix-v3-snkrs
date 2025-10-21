import { createRouter } from "@remix-run/fetch-router"
import { routes } from "./routes"
import { homeHandlers } from "./routes/home"
import { sneakerHandlers } from "./routes/sneakers"

export const router = createRouter()

router.map(routes.home, homeHandlers)
router.map(routes.sneakers, sneakerHandlers)
