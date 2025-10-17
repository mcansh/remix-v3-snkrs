import { createRouter } from "@remix-run/fetch-router";
import { routes } from "./routes";
import { handlers } from "./routes/home";

export const router = createRouter();

router.map(routes, handlers);
