import { describe, it } from "node:test"
import * as assert from "node:assert/strict"

import { ensureOnlyClassOrClassName } from "./cn.js"

describe("ensureOnlyClassOrClassName", () => {
	it("should return className when only className is provided", () => {
		let props = { className: "btn btn-primary" }
		let result = ensureOnlyClassOrClassName(props)
		assert.equal(result, "btn btn-primary")
		assert.deepEqual(props, { className: "btn btn-primary" })
	})

	it("should return class when only class is provided and mutate props", () => {
		let props = { class: "btn btn-secondary" }
		let result = ensureOnlyClassOrClassName(props)
		assert.equal(result, "btn btn-secondary")
		assert.deepEqual(props, { className: "btn btn-secondary" })
	})

	it("should throw an error when both class and className are provided", () => {
		let props = { class: "btn", className: "btn-primary" }
		assert.throws(
			() => ensureOnlyClassOrClassName(props),
			/Cannot use both 'class' and 'className' props simultaneously./,
		)
	})
})
