import { mergeAssets } from "@jacob-ebey/vite-plugin-remix/runtime"
import type { Remix } from "@remix-run/dom"

import appStylesHref from "../app.css?url"
import clientAssets from "../entry.browser.ts?assets=client"
import serverAssets from "../entry.server.tsx?assets=ssr"
import { routes } from "../routes"

export function Document({ children }: { children: Remix.RemixNode }) {
	const assets = mergeAssets(clientAssets, serverAssets)

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
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
				<nav>
					<ul>
						<li>
							<a href={routes.home.index.href()}>Home</a>
						</li>
						<li>
							<a href={routes.sneakers.index.href()}>All Sneakers</a>
						</li>
						<li>
							<a href={routes.sneakers.new.href()}>New Sneaker</a>
						</li>
						<li>
							<a href={routes.sneakers.edit.href({ id: 1 })}>Edit Sneaker</a>
						</li>
						<li>
							<a href={routes.sneakers.show.href({ id: 1 })}>Show Sneaker</a>
						</li>
					</ul>
				</nav>
				{children}
			</body>
		</html>
	)
}
