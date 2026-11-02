import { describe, it } from "node:test"
import * as assert from "node:assert/strict"

import { errorOnlyOptions, reportingFrom } from "./sentry-dsn.js"

describe("reportingFrom", () => {
	it("returns silent when the value is unset", () => {
		assert.deepEqual(reportingFrom(undefined), { mode: "silent" })
	})

	it("returns silent when the value is an empty string", () => {
		assert.deepEqual(reportingFrom(""), { mode: "silent" })
	})

	it("returns the original https string", () => {
		let dsn = "https://example.com"
		assert.deepEqual(reportingFrom(dsn), { mode: "errors", dsn })
		assert.notEqual(dsn, new URL(dsn).href)
	})

	it("returns the original http string", () => {
		let dsn = "http://example.com/1"
		assert.deepEqual(reportingFrom(dsn), { mode: "errors", dsn })
	})

	for (let raw of [
		"not-a-url",
		"postgres://localhost/db",
		" ",
		" https://example.com/1",
		null,
		1,
	]) {
		it(`rejects ${JSON.stringify(raw)}`, () => {
			assert.throws(() => reportingFrom(raw), {
				message: "SENTRY_DSN must be unset, empty, or an http(s) URL",
			})
		})
	}
})

describe("errorOnlyOptions", () => {
	it("builds the shared error-only init payload", () => {
		let reporting = reportingFrom("https://example.com/1")
		assert.equal(reporting.mode, "errors")
		if (reporting.mode !== "errors") {
			return
		}
		assert.deepEqual(errorOnlyOptions(reporting.dsn), {
			dsn: "https://example.com/1",
			tracesSampleRate: 0,
			skipOpenTelemetrySetup: true,
		})
	})
})
