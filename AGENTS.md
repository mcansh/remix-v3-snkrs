# AGENTS.md

## Stack and runtime (don’t guess defaults)
- Node `>=24` and pnpm `10.20.0` are required (`package.json`).
- This is Remix v3 beta + Vite + Cloudflare Worker SSR, not React Router file routes.
- Worker entrypoint is `app/entry.server.ts` via `wrangler.jsonc` `main: "./app/entry.server"`.

## Commands that are actually wired
- Dev server: `pnpm dev`
- Production build: `pnpm build`
- Preview build: `pnpm preview`
- Tests (all types): `pnpm test`
- Format (repo standard): `pnpm format` (uses `oxfmt`, not prettier)
- Typecheck (no script): `pnpm exec tsc --noEmit`

## Fast, focused verification
- Single browser test file: `pnpm test app/components/restful-form.test.browser.tsx --type browser`
- Single E2E test file: `pnpm test app/components/pagination.test.e2e.tsx --type e2e`
- Single server test file pattern: `pnpm test "**/*.test.tsx" --type server`
- Test discovery is controlled by `remix-test.config.ts` glob patterns, and `test/setup.ts` polyfills `document.adoptedStyleSheets`.

## Routing and request flow (critical)
- Route definitions are centralized in `app/routes.ts` using `remix/fetch-router/routes`.
- Route handlers are manually mapped in `app/router.ts` via `router.map(...)`.
- If you add/change a route, update both `app/routes.ts` and the mapped controller exports.
- Controller layout is by domain under `app/controllers/**`; data access lives in `app/models/**`.

## Data and env gotchas
- DB is Cloudflare D1 through Drizzle ORM (`env.db` in `app/lib/env.ts`), schema in `app/db/schema.ts`.
- App env parsing happens from `cloudflare:workers` in `app/lib/env.ts`; missing required vars throws at runtime.
- Drizzle kit config (`drizzle.config.ts`) requires `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN`.
- Migrations are committed SQL in `drizzle/*.sql` with Drizzle metadata in `drizzle/meta/*`.

## Repo conventions worth keeping
- Use `#` import aliases (configured via `package.json` imports `"#*": "./*"`), e.g. `#app/...`.
- Formatting style is tabs + no semicolons (`.oxfmtrc.json`), and `drizzle`, `.yalc`, `.opencode`, `.agents` are formatter-ignored.
- `@mcansh/vite-plugin-remix` is sourced from `file:.yalc/...`; avoid changing dependency manager assumptions without checking local yalc workflow.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in this repo's GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain-doc layout (`CONTEXT.md` + `docs/adr/` at root). See `docs/agents/domain.md`.
