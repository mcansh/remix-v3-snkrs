import type { Remix } from "@remix-run/dom"
import { renderToStream } from "@remix-run/dom/server"
import { html } from "@remix-run/fetch-router"

import { router } from "../router"

export function render(node: Remix.RemixNode, init?: ResponseInit) {
	let body = renderToStream(node, {
		async resolveFrame(src) {
			const response = await router.fetch(new URL(src, "http://localhost"))
			return (await response.text()) as any
		},
	})

	return html(body, init)
}
