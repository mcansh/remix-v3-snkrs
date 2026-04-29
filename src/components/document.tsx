import "@mcansh/vite-plugin-remix/types"
import type { RemixNode } from "remix/ui"
import spriteUrl from "virtual:@mcansh/vite-plugin-svg-sprite"

import appStylesHref from "#src/app.css?url"
import clientAssets from "#src/entry.browser.ts?assets=client"
import serverAssets from "#src/entry.server.ts?assets=ssr"

export function Document() {
	let assets = clientAssets.merge(serverAssets)
	return ({ children }: { children: RemixNode }) => {
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
				</head>
				<body>
					<img
						src={spriteUrl}
						alt=""
						hidden
						// this img tag simply forces the icons to be loaded at a higher
						// priority than the scripts (chrome only for now)
						fetch-priority="high"
					/>
					{children}
					<script async type="module" src={clientAssets.entry} />
				</body>
			</html>
		)
	}
}
