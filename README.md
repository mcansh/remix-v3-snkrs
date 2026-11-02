# remix-v3-snkrs

## Errors

Set `SENTRY_DSN` to an `http` or `https` Sentry DSN to send production errors to Sentry. A DSN needs a public key and a project ID, for example `https://public@example.com/1`.

Leave `SENTRY_DSN` unset, or set it to an empty string, and the process still boots. The SDK does not initialize.

Reporting is errors only. The trace sample rate is `0`. Replay, profiling, and logs stay off.

`pnpm start` and `pnpm dev:server` load `instrument.ts` before `server.ts`. Keep the `--import` flag on both scripts. Handler throws are reported from the HTTP listener, which still responds with status 500.

A non-empty value that is not an `http` or `https` Sentry DSN stops the process at startup. This Railway process does not wrap the Cloudflare Worker.
