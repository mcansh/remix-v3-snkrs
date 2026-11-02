# remix-v3-snkrs

## Errors

Set the `SENTRY_DSN` secret to an `http` or `https` Sentry DSN to send production errors to Sentry. A DSN needs a public key and a project ID, for example `https://public@example.com/1`.

Leave the secret unset, or set it to an empty string, and the Worker still boots. The isolate exports the raw fetch handler. `withSentry` is not called, so the SDK does not initialize.

Reporting is errors only. The trace sample rate is `0`. Replay, profiling, and logs stay off.

Do not put `SENTRY_DSN` in `wrangler.jsonc` vars. Omit it from `.dev.vars` for a local no-op. A non-empty value that is not an `http` or `https` Sentry DSN fails isolate start. This Worker does not run the Railway Node server.
