declare const sentryDsnBrand: unique symbol

export type SentryDsn = string & { readonly [sentryDsnBrand]: true }

export type Reporting =
	| { readonly mode: "silent" }
	| { readonly mode: "errors"; readonly dsn: SentryDsn }

export type ErrorOnlyOptions = {
	readonly dsn: SentryDsn
	readonly tracesSampleRate: 0
	readonly skipOpenTelemetrySetup: true
}

const invalidDsnMessage = "SENTRY_DSN must be unset, empty, or an http(s) URL"

export function reportingFrom(raw: unknown): Reporting {
	if (raw === undefined || raw === "") {
		return { mode: "silent" }
	}

	if (typeof raw !== "string" || raw !== raw.trim()) {
		throw new Error(invalidDsnMessage)
	}

	let parsed: URL
	try {
		parsed = new URL(raw)
	} catch {
		throw new Error(invalidDsnMessage)
	}

	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new Error(invalidDsnMessage)
	}

	return { mode: "errors", dsn: raw as SentryDsn }
}

export function errorOnlyOptions(dsn: SentryDsn): ErrorOnlyOptions {
	// A defined tracesSampleRate, including 0, enables span recording in
	// @sentry/core 10.22.0. skipOpenTelemetrySetup stops the Cloudflare tracer.
	return {
		dsn,
		tracesSampleRate: 0,
		skipOpenTelemetrySetup: true,
	}
}
