import { routes } from "#app/routes.js"
import type { Remix } from "@remix-run/dom"

export function Document({ children }: { children: Remix.RemixNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="color-scheme" content="light dark" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="stylesheet" href={routes.assets.href({ path: "app.css" })} />
				<script type="module" async src={routes.assets.href({ path: "entry.js" })} />
			</head>
			<body>{children}</body>
		</html>
	)
}
