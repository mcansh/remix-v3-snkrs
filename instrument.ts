import * as Sentry from "@sentry/node"

import { errorOnlyOptions, reportingFrom } from "#app/lib/sentry-dsn.js"

let reporting = reportingFrom(process.env.SENTRY_DSN)

if (reporting.mode === "errors") {
	Sentry.init({
		...errorOnlyOptions(reporting.dsn),
		defaultIntegrations: Sentry.getDefaultIntegrationsWithoutPerformance(),
	})
}
