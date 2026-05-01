import * as assert from "remix/assert"
import { describe, it } from "remix/test"
import { render } from "remix/ui/test"

import { AuthenticatedNav } from "./authenticated-nav.tsx"

describe("AuthenticatedNav", () => {
	it("marks current page link with aria-current", (t) => {
		let { $, cleanup } = render(
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
				pathname="/sneakers/new"
			/>,
		)
		t.after(cleanup)

		let addSneaker = $("a[href='/sneakers/new']") as HTMLAnchorElement
		assert.notEqual(addSneaker, null)
		assert.equal(addSneaker.getAttribute("aria-current"), "page")

		let brands = $("a[href='/brands']") as HTMLAnchorElement
		assert.notEqual(brands, null)
		assert.equal(brands.getAttribute("aria-current"), null)
	})

	it("renders mobile menu trigger wired to popover", (t) => {
		let { $, cleanup } = render(
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
				pathname="/logan/sneakers"
			/>,
		)
		t.after(cleanup)

		let trigger = $("button[popovertarget='mobile-nav-menu']") as HTMLButtonElement
		assert.notEqual(trigger, null)
		assert.equal(trigger.getAttribute("aria-haspopup"), "menu")

		let popover = $("#mobile-nav-menu") as HTMLElement
		assert.notEqual(popover, null)
		assert.equal(popover.getAttribute("popover"), "auto")
	})
})
