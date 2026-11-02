import * as assert from "remix/assert"
import { describe, it } from "remix/test"

import { errorOnlyOptions, reportingFrom } from "./sentry-dsn.ts"

const invalidDsnMessage = "SENTRY_DSN must be unset, empty, or an http(s) URL"

describe("reportingFrom", () => {
	it("returns silent for undefined", () => {
		assert.deepEqual(reportingFrom(undefined), { mode: "silent" })
	})

	it("returns silent for an empty string", () => {
		assert.deepEqual(reportingFrom(""), { mode: "silent" })
	})

	it("brands an https URL as the original string", () => {
		let dsn = "https://example.com"
		let reporting = reportingFrom(dsn)

		assert.deepEqual(reporting, { mode: "errors", dsn })
		assert.notEqual(reporting.dsn, new URL(dsn).href)
	})

	it("brands an http URL as the original string", () => {
		let dsn = "http://example.com/1"
		assert.deepEqual(reportingFrom(dsn), { mode: "errors", dsn })
	})

	it("throws when the value is not a url", () => {
		assert.throws(() => reportingFrom("not-a-url"), {
			message: invalidDsnMessage,
		})
	})

	it("throws when the protocol is not http or https", () => {
		assert.throws(() => reportingFrom("postgres://localhost/db"), {
			message: invalidDsnMessage,
		})
	})

	it("throws when the string is only whitespace", () => {
		assert.throws(() => reportingFrom(" "), {
			message: invalidDsnMessage,
		})
	})

	it("throws when the url has surrounding whitespace", () => {
		assert.throws(() => reportingFrom(" https://example.com/1"), {
			message: invalidDsnMessage,
		})
	})

	it("throws for null", () => {
		assert.throws(() => reportingFrom(null), {
			message: invalidDsnMessage,
		})
	})

	it("throws for a number", () => {
		assert.throws(() => reportingFrom(1), {
			message: invalidDsnMessage,
		})
	})
})

describe("errorOnlyOptions", () => {
	it("returns the error-only payload for a branded dsn", () => {
		let dsn = "https://example.com/1"
		let reporting = reportingFrom(dsn)
		if (reporting.mode !== "errors") {
			throw new Error("expected errors")
		}

		assert.deepEqual(errorOnlyOptions(reporting.dsn), {
			dsn,
			tracesSampleRate: 0,
			skipOpenTelemetrySetup: true,
		})
	})
})
