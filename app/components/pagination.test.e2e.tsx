import * as assert from "remix/assert"
import { createTestServer } from "remix/node-fetch-server/test"
import { describe, it } from "remix/test"
import type * as remix from "remix/ui"
import { renderToString } from "remix/ui/server"

import { Pagination } from "./pagination.tsx"

function Doc() {
	return ({ children }: { children: remix.RemixNode }) => {
		return (
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
					<title>Pagination test</title>
				</head>
				<body>{children}</body>
			</html>
		)
	}
}

let allSneakers = Array.from(
	{ length: 13 },
	(_, index) => `Sneaker ${index + 1}`,
)

function html(node: remix.RemixNode) {
	return renderToString(node).then((body) => {
		return new Response(body, {
			headers: { "content-type": "text/html" },
		})
	})
}

function getPage(request: Request): number {
	let url = new URL(request.url)
	let pageRaw = Number(url.searchParams.get("page") ?? "1")
	if (!Number.isFinite(pageRaw) || pageRaw < 1) return 1
	return Math.floor(pageRaw)
}

describe("Pagination e2e", () => {
	it("navigates between pages and updates results", async (t) => {
		let server = await createTestServer((request) => {
			let page = getPage(request)
			let perPage = 12
			let start = (page - 1) * perPage
			let sneakers = allSneakers.slice(start, start + perPage)

			return html(
				<Doc>
					<h1>Lee's collection</h1>
					<ul>
						{sneakers.map((name) => (
							<li key={name}>{name}</li>
						))}
					</ul>
					<Pagination
						basePath="/lee/sneakers"
						brand={null}
						sort="desc"
						perPage={12}
						page={page}
						totalPages={2}
					/>
				</Doc>,
			)
		})

		let page = await t.serve(server)

		await page.goto("/lee/sneakers?page=1&sort=desc&perPage=12")
		assert.equal(await page.locator("li").count(), 12)
		assert.ok(await page.getByText("Sneaker 1", { exact: true }).isVisible())
		assert.equal(await page.getByText("Sneaker 13", { exact: true }).count(), 0)

		await page.getByRole("link", { name: "Go to page 2" }).click()

		assert.ok(page.url().includes("page=2"))
		assert.equal(await page.locator("li").count(), 1)
		assert.ok(await page.getByText("Sneaker 13", { exact: true }).isVisible())
		assert.equal(await page.getByText("Sneaker 1", { exact: true }).count(), 0)
		assert.equal(
			await page
				.getByRole("link", { name: "Go to page 2" })
				.getAttribute("aria-current"),
			"page",
		)
	})

	it("preserves brand, sort, and perPage query params when navigating", async (t) => {
		let server = await createTestServer((request) => {
			let page = getPage(request)

			return html(
				<Doc>
					<h1>Lee's collection</h1>
					<Pagination
						basePath="/lee/sneakers"
						brand="nike"
						sort="asc"
						perPage={24}
						page={page}
						totalPages={3}
					/>
				</Doc>,
			)
		})

		let page = await t.serve(server)

		await page.goto("/lee/sneakers?page=1&sort=asc&perPage=24&brand=nike")
		await page.getByRole("link", { name: "Go to page 2" }).click()

		let url = new URL(page.url())
		assert.equal(url.pathname, "/lee/sneakers")
		assert.equal(url.searchParams.get("page"), "2")
		assert.equal(url.searchParams.get("sort"), "asc")
		assert.equal(url.searchParams.get("perPage"), "24")
		assert.equal(url.searchParams.get("brand"), "nike")
	})

	it("preserves brand values with spaces and casing", async (t) => {
		let server = await createTestServer((request) => {
			let page = getPage(request)

			return html(
				<Doc>
					<h1>Lee's collection</h1>
					<Pagination
						basePath="/lee/sneakers"
						brand="New Balance"
						sort="desc"
						perPage={12}
						page={page}
						totalPages={2}
					/>
				</Doc>,
			)
		})

		let page = await t.serve(server)

		await page.goto(
			"/lee/sneakers?page=1&sort=desc&perPage=12&brand=New%20Balance",
		)
		await page.getByRole("link", { name: "Go to page 2" }).click()

		let url = new URL(page.url())
		assert.equal(url.searchParams.get("page"), "2")
		assert.equal(url.searchParams.get("sort"), "desc")
		assert.equal(url.searchParams.get("perPage"), "12")
		assert.equal(url.searchParams.get("brand"), "New Balance")
	})

	it("falls back to page 1 when page query is invalid", async (t) => {
		let server = await createTestServer((request) => {
			let page = getPage(request)
			let perPage = 12
			let start = (page - 1) * perPage
			let sneakers = allSneakers.slice(start, start + perPage)

			return html(
				<Doc>
					<h1>Lee's collection</h1>
					<ul>
						{sneakers.map((name) => (
							<li key={name}>{name}</li>
						))}
					</ul>
					<Pagination
						basePath="/lee/sneakers/owned"
						brand={null}
						sort="desc"
						perPage={12}
						page={page}
						totalPages={2}
					/>
				</Doc>,
			)
		})

		let page = await t.serve(server)

		await page.goto("/lee/sneakers/owned?page=abc&sort=desc&perPage=12")

		assert.equal(await page.locator("li").count(), 12)
		assert.ok(await page.getByText("Sneaker 1", { exact: true }).isVisible())
		assert.equal(
			await page
				.getByRole("link", { name: "Go to page 1" })
				.getAttribute("aria-current"),
			"page",
		)
		assert.equal(
			await page
				.getByRole("link", { name: "Go to page 2" })
				.getAttribute("href"),
			"/lee/sneakers/owned?page=2&sort=desc&perPage=12",
		)
	})
})
