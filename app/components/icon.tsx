export type IconProps = {
	class?: string
	icon: string
	[key: string]: any
}

export function Icon({ class: className, icon, ...rest }: IconProps) {
	return (
		<svg aria-hidden class={className} {...rest}>
			<use href={icon} />
		</svg>
	)
}
