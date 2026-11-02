# Errors

`SENTRY_DSN` is the Sentry DSN for this app.

When `SENTRY_DSN` is unset or `""`, Railway and the Worker boot without initializing the Sentry SDK.

When `SENTRY_DSN` is an `http` or `https` URL, the SDK initializes with `tracesSampleRate: 0` and OpenTelemetry performance setup skipped. Handler crashes are sent. Traces, replays, profiles, and logs are not.

Railway reads the variable from the service environment. The Worker reads it from a secret, set with `wrangler secret put SENTRY_DSN`. `wrangler.jsonc` has no `SENTRY_DSN` var. Source files do not contain a DSN value.

A throw from a route handler is sent. On Railway, the `catch` in `server.ts` reports it and still returns a 500. On the Worker, `withSentry` reports it and rethrows.

A throw while Railway is still importing `app/lib/env.ts` or the router is sent only when `SENTRY_DSN` was already a valid URL at process start.

Failures caught inside the healthcheck, render `onError`, and frame fetches are not sent.
