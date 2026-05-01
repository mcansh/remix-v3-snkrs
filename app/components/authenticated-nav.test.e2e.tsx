import * as assert from "remix/assert"
import { createTestServer } from "remix/node-fetch-server/test"
import { describe, it } from "remix/test"
import type * as remix from "remix/ui"
import { renderToString } from "remix/ui/server"

import { AuthenticatedNav } from "./authenticated-nav.tsx"

function Doc() {
	return ({ children }: { children: remix.RemixNode }) => {
		return (
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
					<title>Authenticated nav test</title>
				</head>
				<body>{children}</body>
			</html>
		)
	}
}

function html(node: remix.RemixNode) {
	return renderToString(node).then((body) => {
		return new Response(body, {
			headers: { "content-type": "text/html" },
		})
	})
}

describe("AuthenticatedNav e2e", () => {
	it("closes popover after clicking a navigation link", async (t) => {
		let server = await createTestServer((request) => {
			let pathname = new URL(request.url).pathname

			return html(
				<Doc>
					<AuthenticatedNav
						user={{
							id: "u_1",
							email: "logan@mcan.sh",
							given_name: "Logan",
							family_name: "McAnsh",
							password: "hashed",
							password_salt: "salt",
							username: "logan",
							created_at: new Date(),
							updated_at: new Date(),
						}}
						pathname={pathname}
					/>
					<main id="main-content">
						<h1>Page content</h1>
					</main>
				</Doc>,
			)
		})

		let page = await t.serve(server)

		await page.goto("/sneakers")
		await page.getByRole("button", { name: "Menu" }).click()

		let popover = page.locator("#mobile-nav-menu")
		await assert.equal(await popover.count(), 1)

		await page.locator("#mobile-nav-menu").getByRole("link", { name: "Brands" }).click()

		let url = new URL(page.url())
		assert.equal(url.pathname, "/brands")

		assert.equal(await popover.isVisible(), false)
	})
})
