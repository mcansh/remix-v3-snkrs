import { describe, it } from "node:test"
import * as assert from "node:assert/strict"

import { safeRedirect } from "./redirect.js"

describe("safeRedirect", () => {
	it("should redirect to '/' for null or non-string values", () => {
		assert.equal(safeRedirect(null), "/")
		assert.equal(safeRedirect(123 as unknown as FormDataEntryValue), "/")
	})

	it("should redirect to '/' for unsafe URLs", () => {
		assert.equal(safeRedirect("http://malicious.com"), "/")
		assert.equal(safeRedirect("//malicious.com"), "/")
	})

	it("should return the original path for safe relative URLs", () => {
		assert.equal(safeRedirect("/dashboard"), "/dashboard")
		assert.equal(safeRedirect("/profile/settings"), "/profile/settings")
	})
})
