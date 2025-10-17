import { createRouter } from "@remix-run/fetch-router";
import { handlers } from "./routes/home";
import { routes } from "./routes";

export const router = createRouter();

router.map(routes, handlers);
