import type { Remix } from "@remix-run/dom"
import spriteUrl from "virtual:@mcansh/vite-plugin-svg-sprite"

import appStylesHref from "../app.css?url"
import clientAssets from "../entry.browser.ts?assets=client"
import serverAssets from "../entry.server.tsx?assets=ssr"

export function Document({
	children,
	title,
}: {
	children: Remix.RemixNode
	title?: string
}) {
	let assets = clientAssets.merge(serverAssets)

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				{title ? <title>{title}</title> : null}
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="stylesheet" href={appStylesHref} />
				{assets.css.map((attrs) => (
					<link key={attrs.href} {...attrs} rel="stylesheet" />
				))}
				{assets.js.map((attrs) => (
					<link key={attrs.href} {...attrs} rel="modulepreload" />
				))}
				<script async type="module" src={clientAssets.entry} />
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
			</body>
		</html>
	)
}
