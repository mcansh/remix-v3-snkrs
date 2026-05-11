import * as assert from "remix/assert"
import { createTestServer } from "remix/node-fetch-server/test"
import { describe, it } from "remix/test"
import type * as remix from "remix/ui"

import { html } from "#test/utils.ts"

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

describe("AuthenticatedNav e2e", () => {
	it("closes popover after clicking a navigation link", async (t) => {
		let server = await createTestServer((request) => {
			let pathname = new URL(request.url).pathname

			return html(
				<Doc>
					<AuthenticatedNav user={{ username: "logan" }} pathname={pathname} />
					<main id="main-content">
						<h1>Page content</h1>
					</main>
				</Doc>,
			)
		})

		let page = await t.serve(server)

		await page.goto("/sneakers")
		let trigger = page.getByRole("button", { name: "Menu" })
		await trigger.click()

		let popover = page.locator(trigger.getAttribute("popovertarget"))
		assert.equal(await popover.count(), 1)

		await page.locator("#").getByRole("link", { name: "Brands" }).click()

		let url = new URL(page.url())
		assert.equal(url.pathname, "/brands")

		assert.equal(await popover.isVisible(), false)
	})
})
