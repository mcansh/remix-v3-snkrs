import * as assert from "remix/assert"
import { describe, it } from "remix/test"
import { render } from "remix/ui/test"

import { Pagination } from "./pagination.tsx"

describe("Pagination", () => {
	it("does not render when there is only one page", (t) => {
		let { $, cleanup } = render(
			<Pagination
				basePath="/lee/sneakers"
				brand={null}
				sort="desc"
				perPage={12}
				page={1}
				totalPages={1}
			/>,
		)
		t.after(cleanup)

		assert.equal($("nav"), null)
	})

	it("renders page links with query params and current page state", (t) => {
		let { $, cleanup } = render(
			<Pagination
				basePath="/lee/sneakers"
				brand="Nike"
				sort="asc"
				perPage={24}
				page={2}
				totalPages={3}
			/>,
		)
		t.after(cleanup)

		let nav = $("nav[aria-label='Pagination']") as HTMLElement
		assert.notEqual(nav, null)

		let links = Array.from(nav.querySelectorAll("a"))
		assert.equal(links.length, 3)

		let first = links[0] as HTMLAnchorElement
		let second = links[1] as HTMLAnchorElement
		let third = links[2] as HTMLAnchorElement

		assert.ok(first, "first link should be present")
		assert.ok(second, "second link should be present")
		assert.ok(third, "third link should be present")

		assert.equal(first.textContent.trim(), "1")
		assert.equal(first.getAttribute("aria-label"), "Go to page 1")
		assert.equal(
			first.getAttribute("href"),
			"/lee/sneakers?page=1&sort=asc&perPage=24&brand=Nike",
		)
		assert.equal(first.getAttribute("aria-current"), null)

		assert.equal(second.textContent.trim(), "2")
		assert.equal(second.getAttribute("aria-label"), "Go to page 2")
		assert.equal(
			second.getAttribute("href"),
			"/lee/sneakers?page=2&sort=asc&perPage=24&brand=Nike",
		)
		assert.equal(second.getAttribute("aria-current"), "page")

		assert.equal(third.textContent.trim(), "3")
		assert.equal(third.getAttribute("aria-label"), "Go to page 3")
		assert.equal(
			third.getAttribute("href"),
			"/lee/sneakers?page=3&sort=asc&perPage=24&brand=Nike",
		)
		assert.equal(third.getAttribute("aria-current"), null)
	})

	it("omits brand from query params when brand is null", (t) => {
		let { $, cleanup } = render(
			<Pagination
				basePath="/lee/sneakers"
				brand={null}
				sort="desc"
				perPage={12}
				page={1}
				totalPages={2}
			/>,
		)
		t.after(cleanup)

		let first = $("a") as HTMLAnchorElement
		assert.ok(first, "first link should be present")
		assert.equal(first.getAttribute("aria-label"), "Go to page 1")
		assert.equal(
			first.getAttribute("href"),
			"/lee/sneakers?page=1&sort=desc&perPage=12",
		)
	})
})
