import type { Remix } from "@remix-run/dom"

import { cn, ensureOnlyClassOrClassName } from "#app/lib/cn.js"

export function Label(props: Remix.Props<"label">) {
	let className = ensureOnlyClassOrClassName(props)

	return (
		<label
			data-slot="label"
			class={cn(
				"gap-2 text-xs leading-none group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
				className,
			)}
			{...props}
		/>
	)
}
