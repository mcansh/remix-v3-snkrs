"use client"

import type { Remix } from "@remix-run/dom"
import { press } from "@remix-run/events/press"

export function Counter(this: Remix.Handle) {
	let count = 0

	const pressIncrement = press(() => {
		count++
		this.update()
	})

	return () => {
		return (
			<button
				on={pressIncrement}
				css={{
					background: "hsl(340deg 100% 32%)",
					border: "none",
					borderRadius: "12px",
					padding: "0",
					cursor: "pointer",
					outlineOffset: "4px",
					marginTop: "12px",
					userSelect: "none",

					"&:active > span": {
						transform: "translateY(-2px)",
					},
				}}
			>
				<span
					css={{
						display: "block",
						padding: "12px 42px",
						borderRadius: "12px",
						fontSize: "1.25rem",
						background: "hsl(345deg 100% 47%)",
						color: "white",
						transform: "translateY(-6px)",
					}}
				>
					Count: <span>{count}</span>
				</span>
			</button>
		)
	}
}
