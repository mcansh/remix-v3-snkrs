declare const sentryDsnBrand: unique symbol

export type SentryDsn = string & { readonly [sentryDsnBrand]: true }

export type Reporting =
	| { readonly mode: "silent" }
	| { readonly mode: "errors"; readonly dsn: SentryDsn }

export type ErrorOnlyOptions = {
	readonly dsn: SentryDsn
	readonly tracesSampleRate: 0
	readonly skipOpenTelemetrySetup: true
	readonly tracesSampler: () => 0
}

const invalidDsnMessage =
	"SENTRY_DSN must be unset, empty, or an http(s) Sentry DSN"

function isSentryDsnUrl(url: URL): boolean {
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		return false
	}
	if (url.username === "") {
		return false
	}
	let projectId = url.pathname.split("/").filter(Boolean).at(-1)
	return projectId !== undefined
}

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

	if (!isSentryDsnUrl(parsed)) {
		throw new Error(invalidDsnMessage)
	}

	return { mode: "errors", dsn: raw as SentryDsn }
}

function neverSample(): 0 {
	return 0
}

export function errorOnlyOptions(dsn: SentryDsn): ErrorOnlyOptions {
	// tracesSampler wins over a sampled incoming sentry-trace in sampleSpan 10.22.0.
	return {
		dsn,
		tracesSampleRate: 0,
		skipOpenTelemetrySetup: true,
		tracesSampler: neverSample,
	}
}
