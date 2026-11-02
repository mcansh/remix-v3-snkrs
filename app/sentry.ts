import * as Sentry from "@sentry/cloudflare"
import { env as cfEnv } from "cloudflare:workers"

import { errorOnlyOptions, reportingFrom } from "./lib/sentry-dsn.ts"

export function reportHandlerErrors<H extends ExportedHandler>(handler: H): H {
	let reporting = reportingFrom(readSentryDsn(cfEnv))
	if (reporting.mode === "silent") {
		return handler
	}

	let options = errorOnlyOptions(reporting.dsn)
	return Sentry.withSentry(() => options, handler) as H
}

function readSentryDsn(source: unknown): unknown {
	if (
		typeof source !== "object" ||
		source === null ||
		!("SENTRY_DSN" in source)
	) {
		return undefined
	}

	return source.SENTRY_DSN
}
