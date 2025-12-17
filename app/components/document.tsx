import type { Remix } from "@remix-run/dom"

import { routes } from "#app/routes.js"

export function Document({
	bodyClassName,
	children,
}: {
	bodyClassName?: string
	children: Remix.RemixNode
}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="color-scheme" content="light dark" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="stylesheet" href={routes.assets.href({ path: "app.css" })} />
				<script
					type="module"
					async
					src={routes.assets.href({ path: "entry.js" })}
				/>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap"
				/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Space+Grotesk:ital,wght@0,300..700;1,300..700&display=swap"
				/>
			</head>
			<body class={bodyClassName}>{children}</body>
		</html>
	)
}
