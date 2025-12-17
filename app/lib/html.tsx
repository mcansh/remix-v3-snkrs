import type { Remix } from "@remix-run/dom"
import { renderToStream } from "@remix-run/dom/server"
import { createHtmlResponse } from "@remix-run/response/html"

import { Document } from "#app/components/document.js"
import { router } from "#app/router.js"

export function render(node: Remix.RemixNode, init?: ResponseInit): Response {
	let body = renderToStream(node, {
		async resolveFrame(src) {
			const response = await router.fetch(new URL(src, "http://localhost"))
			return (await response.text()) as any
		},
		onError(error, context) {
			console.error("Error during render:", error, context)
		},
	})

	return createHtmlResponse(body, init)
}

export function renderDocument(
	children: Remix.RemixNode,
	bodyClassNameOrInit?: string | ResponseInit,
	init?: ResponseInit,
): Response {
	if (typeof bodyClassNameOrInit === "string") {
		init ??= {}

		return render(
			<Document bodyClassName={bodyClassNameOrInit}>{children}</Document>,
			init,
		)
	}

	return render(<Document>{children}</Document>, init)
}
