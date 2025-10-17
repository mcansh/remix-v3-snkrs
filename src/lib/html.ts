import type { Remix } from "@remix-run/dom";
import { renderToStream } from "@remix-run/dom/server";
import type { Router } from "@remix-run/fetch-router";

export function html(router: Router, node: Remix.RemixNode) {
  return new Response(
    renderToStream(node, {
      async resolveFrame(src) {
        const response = await router.fetch(new URL(src, "http://localhost"));
        return (await response.text()) as any;
      },
    }),
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    }
  );
}
