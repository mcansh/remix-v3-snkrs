import { createHtmlResponse } from "remix/response/html"
import type * as remix from "remix/ui"
import { renderToString } from "remix/ui/server"

export async function html(node: remix.RemixNode) {
	let body = await renderToString(node)
	return createHtmlResponse(body)
}
