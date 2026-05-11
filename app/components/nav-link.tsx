import type { Handle, Props } from "remix/ui"
function removeTrailingSlash(path: string): string {
	return path.endsWith("/") ? path.slice(0, -1) : path
}

function isCurrentPath(pathname: string, href: string): boolean {
	if (href === "/") return pathname === "/"

	let normalizedPath = removeTrailingSlash(pathname)
	let normalizedHref = removeTrailingSlash(href)

	return normalizedPath === normalizedHref
}

export type NavLinkProps = Omit<Props<"a">, "href" | "class" | "className"> & {
	class: string | (({ active }: { active: boolean }) => string)
	activePathname: string
}

export function NavLink(handle: Handle<{ href: string }>) {
	return ({
		activePathname,
		children,
		class: className,
		...props
	}: NavLinkProps) => {
		let isCurrent = isCurrentPath(activePathname, handle.props.href)
		let classValue =
			typeof className === "string"
				? className
				: className({ active: isCurrent })

		return (
			<a
				href={handle.props.href}
				aria-current={isCurrent ? "page" : undefined}
				class={classValue}
				{...props}
			>
				{children}
			</a>
		)
	}
}
