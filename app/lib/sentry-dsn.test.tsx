import * as assert from "remix/assert"
import { describe, it } from "remix/test"

import { errorOnlyOptions, reportingFrom } from "./sentry-dsn.ts"

const invalidDsnMessage =
	"SENTRY_DSN must be unset, empty, or an http(s) Sentry DSN"

describe("reportingFrom", () => {
	it("returns silent for undefined", () => {
		assert.deepEqual(reportingFrom(undefined), { mode: "silent" })
	})

	it("returns silent for an empty string", () => {
		assert.deepEqual(reportingFrom(""), { mode: "silent" })
	})

	it("brands an https DSN as the original string", () => {
		let dsn = "https://public@Example.COM/1"
		let reporting = reportingFrom(dsn)

		assert.deepEqual(reporting, { mode: "errors", dsn })
		assert.notEqual(reporting.dsn, new URL(dsn).href)
	})

	it("brands an http DSN as the original string", () => {
		let dsn = "http://public@10.0.0.1:9000/1"
		assert.deepEqual(reportingFrom(dsn), { mode: "errors", dsn })
	})

	it("accepts a self-hosted DSN with a path prefix", () => {
		let dsn = "https://public@sentry.example.com/sentry/1"
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
		assert.throws(() => reportingFrom(" https://public@example.com/1"), {
			message: invalidDsnMessage,
		})
	})

	it("throws when the public key is missing", () => {
		assert.throws(() => reportingFrom("https://example.com"), {
			message: invalidDsnMessage,
		})
	})

	it("throws when the public key is missing and a path is present", () => {
		assert.throws(() => reportingFrom("http://example.com/1"), {
			message: invalidDsnMessage,
		})
	})

	it("throws when the project id is missing", () => {
		assert.throws(() => reportingFrom("https://public@example.com"), {
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
		let dsn = "https://public@example.com/1"
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
