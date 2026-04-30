import * as assert from "remix/assert"
import { describe, it } from "remix/test"
import { render } from "remix/ui/test"

import type { SerializedSneaker } from "#app/models/sneaker.ts"
import { routes } from "#app/routes.ts"
import { SneakerGrid } from "./sneaker-grid.tsx"

const baseSneaker: SerializedSneaker = {
	id: "sneaker-1",
	brand: "Nike",
	colorway: "Red/White",
	created_at: "2024-01-01T00:00:00.000Z",
	image: "https://cdn.example.com/sneakers/1.jpg",
	model: "Air Max",
	purchase_date: "2024-01-01",
	purchase_price: "$120.00",
	retail_price: "$180.00",
	size: 10,
	sold: false,
	sold_date: null,
	sold_price: null,
	srcSet: "https://cdn.example.com/sneakers/1.jpg 1x",
	updated_at: "2024-01-02T00:00:00.000Z",
	user_id: "user-1",
}

describe("SneakerGrid", () => {
	it("renders a list item for each sneaker", (t) => {
		let sneakers = [
			baseSneaker,
			{
				...baseSneaker,
				id: "sneaker-2",
				brand: "Adidas",
				model: "Ultraboost",
				colorway: "Black/White",
				image: "https://cdn.example.com/sneakers/2.jpg",
				srcSet: "https://cdn.example.com/sneakers/2.jpg 1x",
			},
		]
		let { $$, cleanup } = render(<SneakerGrid sneakers={sneakers} />)
		t.after(cleanup)
		assert.equal($$("li").length, 2)
	})

	it("renders the sneaker imagery and details", (t) => {
		let { $, cleanup } = render(<SneakerGrid sneakers={[baseSneaker]} />)
		t.after(cleanup)
		let image = $("img") as HTMLImageElement
		let model = $("p[data-testid='sneaker.model']") as HTMLParagraphElement
		let colorway = $(
			"p[data-testid='sneaker.colorway']",
		) as HTMLParagraphElement
		let purchasePrice = $(
			"p[data-testid='sneaker.purchase_price']",
		) as HTMLParagraphElement
		assert.equal(image.src, baseSneaker.image)
		assert.equal(image.srcset, baseSneaker.srcSet)
		assert.equal(
			image.alt,
			`${baseSneaker.model} from ${baseSneaker.brand} in ${baseSneaker.colorway}`,
		)
		assert.equal(model.textContent, baseSneaker.model)
		assert.equal(colorway.textContent, baseSneaker.colorway)
		assert.equal(purchasePrice.textContent, baseSneaker.purchase_price)
	})

	it("wires brand, view, edit, and delete actions", (t) => {
		let { $$, $, cleanup } = render(<SneakerGrid sneakers={[baseSneaker]} />)
		t.after(cleanup)
		let links = Array.from($$("a")) as HTMLAnchorElement[]
		let [brandLink, viewLink, editLink] = links
		assert.equal(
			brandLink.getAttribute("href"),
			routes.brands.show.href({ brand: baseSneaker.brand }),
		)
		assert.equal(
			viewLink.getAttribute("href"),
			routes.sneakers.show.href({ id: baseSneaker.id }),
		)
		assert.equal(
			editLink.getAttribute("href"),
			routes.sneakers.edit.href({ id: baseSneaker.id }),
		)

		let form = $("form") as HTMLFormElement
		let hidden = $('input[type="hidden"]') as HTMLInputElement
		let submit = $('button[type="submit"]') as HTMLButtonElement
		assert.equal(form.method, "post")
		assert.equal(
			form.getAttribute("action"),
			routes.sneakers.destroy.href({ id: baseSneaker.id }),
		)
		assert.equal(hidden.name, "_method")
		assert.equal(hidden.value, "DELETE")
		assert.equal(submit.textContent, "Delete")
	})
})
