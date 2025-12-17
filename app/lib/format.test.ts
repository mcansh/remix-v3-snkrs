import { it } from "node:test"
import * as assert from "node:assert/strict"

import { formatDate, formatMoney } from "./format.js"

it("formatMoney formats cents to USD", () => {
	assert.equal(formatMoney(0), "$0.00")
	assert.equal(formatMoney(1), "$0.01")
})

it("formatDate formats date to en-US format", () => {
	assert.equal(formatDate(new Date("2024-01-01")), "Jan 1, 2024")
	assert.equal(formatDate(1704067200000), "Jan 1, 2024")
})
