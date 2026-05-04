# AGENTS.md

## Runtime and package manager

- Use Node `>=24` and the pinned pnpm from `package.json` (`pnpm@10.33.2...`).
- This is a single-package repo; `pnpm-workspace.yaml` only declares `onlyBuiltDependencies`.
- Keep `@mcansh/vite-plugin-remix` on `file:.yalc/@mcansh/vite-plugin-remix` unless you intentionally change local yalc workflow.
- `.npmrc` maps `@jsr` to `https://npm.jsr.io`; keep it if install/resolve behavior is touched.

## App wiring that is easy to break

- App routes are **not** file-convention routes; they are declared in `app/routes.ts` (`remix/fetch-router/routes`).
- Route handlers are mapped separately in `app/router.ts` via `router.map(...)`; route changes usually require edits in both files.
- Worker runtime entrypoint is `app/entry.server.ts` (`wrangler.jsonc` `main: "./app/entry.server"`).
- Vite uses `remix({ serverHandler: false })` in `vite.config.ts`; request handling stays in the worker router, not a generated server handler.

## Commands

- Dev: `pnpm dev`
- Build: `pnpm build`
- Preview: `pnpm preview`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- Format: `pnpm format` (uses `oxfmt`, not Prettier)

## Focused verification

- Run one test file with Remix test runner: `pnpm test <path> --type browser|e2e|server`.
- Test discovery is `**/*.test{,.browser,.e2e}.tsx` (`remix-test.config.ts`), so `*.test.ts` files are not in default test globs.
- Browser tests rely on `test/setup.ts` polyfill for `document.adoptedStyleSheets`.

## Env, DB, and generated artifacts

- `app/env.ts` validates env from `cloudflare:workers`; missing/invalid vars throw at startup.
- D1 binding name must stay `db` (`wrangler.jsonc` + `app/env.ts` expect that exact binding).
- Drizzle schema source is `app/db/schema.ts`; migrations are in `drizzle/` (with `drizzle/meta/*` snapshots).
- `drizzle.config.ts` requires `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, and `CLOUDFLARE_D1_TOKEN`.
- `worker-configuration.d.ts` is Wrangler-generated (`wrangler types`); regenerate instead of hand-editing.

## Lint/format constraints that commonly fail CI/local checks

- Internal import alias is `#*` (for example `#app/...`) from `package.json` imports.
- Local TS/TSX imports must include file extensions (`import/extensions` is enforced by oxlint).
- `oxfmt` enforces tabs, no semicolons, import sorting, and Tailwind class sorting.
