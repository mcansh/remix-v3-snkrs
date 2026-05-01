import type { User } from "#app/db/schema.ts"
import { routes } from "#app/routes.ts"
import { clientEntry, on, ref, type Handle } from "remix/ui"

type NavLink = {
	label: string
	href: string
	primary: boolean
}

function isCurrentPath(pathname: string, href: string): boolean {
	if (href === "/") return pathname === "/"

	let normalizedPath = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
	let normalizedHref = href.endsWith("/") ? href.slice(0, -1) : href

	return normalizedPath === normalizedHref
}

let mobilePrimaryClass =
	"block rounded-md bg-slate-900 px-3 py-2 text-sm text-white no-underline transition-colors hover:bg-slate-800 aria-[current=page]:bg-blue-700"
let mobileLinkClass =
	"block rounded-md px-3 py-2 text-sm text-slate-700 no-underline transition-colors hover:bg-slate-100 hover:text-slate-900 aria-[current=page]:bg-blue-50 aria-[current=page]:font-semibold aria-[current=page]:text-blue-700"

const mobileMenuId = "mobile-nav-menu"

export const MobileMenu = clientEntry(
	import.meta.url,
	function MobileMenu(handle: Handle<{ pathname: string; links: NavLink[] }>) {
		let mobileMenu: HTMLDivElement | null = null
		let closeOnNavigate = on<HTMLElement>("click", (event) => {
			let target = event.target
			if (!(target instanceof Element)) return
			if (!target.closest('a[href],button[type="submit"]')) return
			if (!mobileMenu || !("hidePopover" in mobileMenu)) return

			mobileMenu.hidePopover()
		})

		return () => {
			let { pathname, links } = handle.props

			return (
				<div class="relative" mix={closeOnNavigate}>
					<button
						type="button"
						popovertarget={mobileMenuId}
						aria-haspopup="menu"
						class="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
					>
						Menu
					</button>
					<div
						id={mobileMenuId}
						mix={[
							ref((node) => {
								mobileMenu = node
							}),
						]}
						popover="auto"
						class="fixed top-14 right-4 left-auto z-20 m-0 max-h-[calc(100dvh-4.5rem)] w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_oklch(0.2_0.03_250/0.15)]"
					>
						<nav aria-label="Primary" class="grid gap-1">
							{links.map((link) => {
								let isCurrent = isCurrentPath(pathname, link.href)
								let className = link.primary
									? mobilePrimaryClass
									: mobileLinkClass

								return (
									<a
										key={link.label}
										href={link.href}
										aria-current={isCurrent ? "page" : undefined}
										class={className}
									>
										{link.label}
									</a>
								)
							})}
						</nav>
						<div class="mt-2 border-t border-slate-200 pt-2">
							<form method="post" action={routes.auth.logout.action.href()}>
								<button
									type="submit"
									class="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
								>
									Logout
								</button>
							</form>
						</div>
					</div>
				</div>
			)
		}
	},
)

export function AuthenticatedNav() {
	return ({ user, pathname }: { user: User; pathname: string }) => {
		let links: NavLink[] = [
			{
				label: "My Sneakers",
				href: routes.sneakers.index.href(),
				primary: false,
			},
			{
				label: "Showcase",
				href: routes.showcase.user.href({ username: user.username }),
				primary: false,
			},
			{
				label: "Brands",
				href: routes.brands.index.href(),
				primary: false,
			},
			{
				label: "Add Sneaker",
				href: routes.sneakers.new.href(),
				primary: true,
			},
		]

		let desktopPrimaryClass =
			"rounded-full bg-slate-900 px-3 py-1.5 text-sm text-white no-underline transition-colors hover:bg-slate-800 aria-[current=page]:bg-blue-700 aria-[current=page]:font-semibold"
		let desktopLinkClass =
			"rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 no-underline transition-colors hover:border-slate-400 hover:text-slate-900 aria-[current=page]:border-blue-200 aria-[current=page]:bg-blue-50 aria-[current=page]:font-semibold aria-[current=page]:text-blue-700"

		return (
			<header class="border-b border-slate-200 bg-white/85 backdrop-blur">
				<div class="container py-3">
					<div class="flex items-center justify-between md:hidden">
						<div class="flex items-center gap-2">
							<p class="text-sm text-slate-600">@{user.username}</p>
						</div>
						<MobileMenu links={links} pathname={pathname} />
					</div>

					<div class="hidden items-center justify-between gap-3 md:flex">
						<nav aria-label="Primary" class="flex flex-wrap items-center gap-2">
							{links.map((link) => {
								let isCurrent = isCurrentPath(pathname, link.href)
								let className = link.primary
									? desktopPrimaryClass
									: desktopLinkClass

								return (
									<a
										key={link.label}
										href={link.href}
										aria-current={isCurrent ? "page" : undefined}
										class={className}
									>
										{link.label}
									</a>
								)
							})}
						</nav>
						<div class="flex items-center gap-2">
							<p class="text-sm text-slate-600">@{user.username}</p>
							<form method="post" action={routes.auth.logout.action.href()}>
								<button
									type="submit"
									class="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
								>
									Logout
								</button>
							</form>
						</div>
					</div>
				</div>
			</header>
		)
	}
}
