import "@mcansh/vite-plugin-remix/types"
import { getContext } from "remix/async-context-middleware"
import type { RemixNode } from "remix/ui"
import spriteUrl from "virtual:@mcansh/vite-plugin-svg-sprite"

import appStylesHref from "#app/app.css?url"
import { AuthenticatedNav } from "#app/components/authenticated-nav.tsx"
import clientAssets from "#app/entry.browser.ts?assets=client"
import serverAssets from "#app/entry.server.ts?assets=ssr"
import { getCurrentUserSafely } from "#app/utils/context.ts"

export function Document() {
	let assets = clientAssets.merge(serverAssets)
	let user = getCurrentUserSafely()
	let context = getContext()
	let url = context.url
	return ({ children, head }: { children: RemixNode; head?: RemixNode }) => {
		return (
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
					<meta name="color-scheme" content="light dark" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<link rel="stylesheet" href={appStylesHref} />
					{assets.css.map((attrs) => (
						<link key={attrs.href} {...attrs} rel="stylesheet" />
					))}
					{assets.js.map((attrs) => (
						<link key={attrs.href} {...attrs} rel="modulepreload" />
					))}
					{head}
				</head>
				<body>
					<a
						href="#main-content"
						class="absolute top-2 left-2 z-50 -translate-y-16 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white no-underline transition-transform focus:translate-y-0 focus:ring-2 focus:ring-blue-300 focus:outline-none"
					>
						Skip to content
					</a>
					<img
						src={spriteUrl}
						alt=""
						hidden
						// this img tag simply forces the icons to be loaded at a higher
						// priority than the scripts (chrome only for now)
						fetch-priority="high"
					/>
					{user ? (
						<AuthenticatedNav user={user} pathname={url.pathname} />
					) : null}
					<main id="main-content">{children}</main>
					<script async type="module" src={clientAssets.entry} />
				</body>
			</html>
		)
	}
}
