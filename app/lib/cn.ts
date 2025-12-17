import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs))
}

export function ensureOnlyClassOrClassName(props: {
	class?: string
	className?: string
}): string {
	if (props.class && props.className) {
		throw new Error(
			"Cannot use both 'class' and 'className' props simultaneously.",
		)
	}

	if (props.class) {
		let classValue = props.class
		delete props.class
		props.className = classValue
		return classValue
	}

	if (props.className) {
		return props.className
	}

	return ""
}
