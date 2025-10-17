import express from "express";

import { createRequestListener } from "@remix-run/node-fetch-server";

// @ts-expect-error - no types for this
import ssr from "./dist/ssr/entry.server.js";

const app = express();
app.use(
  "/assets",
  express.static("dist/client/assets", {
    maxAge: "1y",
    immutable: true,
  })
);
app.use(express.static("dist/client", { maxAge: "5m" }));

app.use(createRequestListener(ssr.fetch));

const port = Number.parseInt(process.env.PORT || "3000");
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
