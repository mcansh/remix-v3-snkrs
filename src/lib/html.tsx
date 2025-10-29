import type { Remix } from "@remix-run/dom"
import { renderToStream } from "@remix-run/dom/server"
import { html } from "@remix-run/fetch-router"

import { Document } from "../components/document.tsx"
import { router } from "../router.ts"

export function render(node: Remix.RemixNode, init?: ResponseInit) {
	let body = renderToStream(node, {
		async resolveFrame(src) {
			const response = await router.fetch(new URL(src, "http://localhost"))
			return (await response.text()) as any
		},
		onError(error, context) {
			console.error("Error during render:", error, context)
		},
	})

	return html(body, init)
}

export function renderDocument(children: Remix.RemixNode, init?: ResponseInit) {
	return render(<Document>{children}</Document>, init)
}
