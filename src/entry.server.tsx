import { Frame } from "@remix-run/dom";
import {
  createRouter,
  route,
  type RouteHandlers,
} from "@remix-run/fetch-router";

import { Document } from "./components/document";
import { Counter } from "./components/counter";
import { Counter2 } from "./components/counter2";
import { html } from "./lib/html";

const routes = route({
  home: "/",
  frames: { sayHello: "/frames/say-hello/:name" },
});

const router = createRouter();

const handlers = {
  home({ url }) {
    return html(
      router,
      <Document>
        <title>Hello, World!</title>
        <h1>Hello, World!</h1>
        <Counter />
        <Frame
          src={routes.frames.sayHello.href({
            name: url.searchParams.get("name") || "World",
          })}
        />
      </Document>
    );
  },
  frames: {
    sayHello({ params: { name } }) {
      return html(
        router,
        <section>
          <h2>Hello, {name}</h2>
          <Counter2 />
        </section>
      );
    },
  },
} satisfies RouteHandlers<typeof routes>;

router.map(routes, handlers);

export default {
  fetch(request: Request) {
    return router.fetch(request);
  },
};

if (import.meta.hot) {
  import.meta.hot.accept();
}
