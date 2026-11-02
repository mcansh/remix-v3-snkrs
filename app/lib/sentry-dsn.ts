declare const sentryDsnBrand: unique symbol

/** Branded http(s) URL. Only `reportingFrom` creates one. */
export type SentryDsn = string & { readonly [sentryDsnBrand]: true }

/**
 * Process-lifetime reporting mode.
 * `silent` has no DSN. `errors` always has one.
 * A sample rate is not part of this type.
 */
export type Reporting =
	| { readonly mode: "silent" }
	| { readonly mode: "errors"; readonly dsn: SentryDsn }

/**
 * Shared init payload. `tracesSampleRate` is the literal `0`.
 * `skipOpenTelemetrySetup` is `true` because a defined `tracesSampleRate`,
 * including `0`, makes `hasSpansEnabled` true in `@sentry/core` 10.22.0.
 * Node adds `defaultIntegrations: getDefaultIntegrationsWithoutPerformance()`
 * in `instrument.ts`. That list is Node-only and must not live in this file.
 */
export type ErrorOnlyOptions = {
	readonly dsn: SentryDsn
	readonly tracesSampleRate: 0
	readonly skipOpenTelemetrySetup: true
}

const invalidSentryDsnMessage =
	"SENTRY_DSN must be unset, empty, or an http(s) URL"

export function reportingFrom(raw: unknown): Reporting {
	if (raw === undefined || raw === "") {
		return { mode: "silent" }
	}
	if (typeof raw !== "string" || raw !== raw.trim()) {
		throw new Error(invalidSentryDsnMessage)
	}
	let url: URL
	try {
		url = new URL(raw)
	} catch {
		throw new Error(invalidSentryDsnMessage)
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error(invalidSentryDsnMessage)
	}
	return { mode: "errors", dsn: raw as SentryDsn }
}

export function errorOnlyOptions(dsn: SentryDsn): ErrorOnlyOptions {
	return { dsn, tracesSampleRate: 0, skipOpenTelemetrySetup: true }
}
