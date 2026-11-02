import { describe, it } from "node:test"
import * as assert from "node:assert/strict"

import { errorOnlyOptions, reportingFrom } from "./sentry-dsn.js"

const invalidSentryDsnMessage =
	"SENTRY_DSN must be unset, empty, or an http(s) Sentry DSN"

describe("reportingFrom", () => {
	it("returns silent when the value is unset", () => {
		assert.deepEqual(reportingFrom(undefined), { mode: "silent" })
	})

	it("returns silent when the value is an empty string", () => {
		assert.deepEqual(reportingFrom(""), { mode: "silent" })
	})

	it("returns the original https DSN", () => {
		let dsn = "https://public@Example.COM/1"
		assert.deepEqual(reportingFrom(dsn), { mode: "errors", dsn })
		assert.notEqual(dsn, new URL(dsn).href)
	})

	it("returns the original http DSN", () => {
		let dsn = "http://public@10.0.0.1:9000/1"
		assert.deepEqual(reportingFrom(dsn), { mode: "errors", dsn })
	})

	it("accepts a self-hosted DSN with a path prefix", () => {
		let dsn = "https://public@sentry.example.com/sentry/1"
		assert.deepEqual(reportingFrom(dsn), { mode: "errors", dsn })
	})

	for (let raw of [
		"not-a-url",
		"postgres://localhost/db",
		" ",
		" https://public@example.com/1",
		"https://example.com",
		"http://example.com/1",
		"https://public@example.com",
		null,
		1,
	]) {
		it(`rejects ${JSON.stringify(raw)}`, () => {
			assert.throws(() => reportingFrom(raw), {
				message: invalidSentryDsnMessage,
			})
		})
	}
})

describe("errorOnlyOptions", () => {
	it("builds the shared error-only init payload", () => {
		let dsn = "https://public@example.com/1"
		let reporting = reportingFrom(dsn)
		assert.equal(reporting.mode, "errors")
		if (reporting.mode !== "errors") {
			return
		}
		assert.deepEqual(errorOnlyOptions(reporting.dsn), {
			dsn,
			tracesSampleRate: 0,
			skipOpenTelemetrySetup: true,
		})
	})
})
