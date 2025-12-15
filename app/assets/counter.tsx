import { routes } from "#app/routes.js"
import { hydrated, type Remix } from "@remix-run/dom"
import { press } from "@remix-run/events/press"

export const Counter = hydrated(
	routes.assets.href({ path: "counter.js#Counter" }),
	function (this: Remix.Handle) {
		let count = 0

		const pressIncrement = press(() => {
			count++
			this.update()
		})

		return () => {
			return (
				<button
					on={pressIncrement}
					class="group mt-3 cursor-pointer rounded-xl bg-[hsl(340deg_100%_32%)] outline-offset-4 select-none"
				>
					<span class="block -translate-y-1.5 rounded-xl bg-[hsl(345deg_100%_47%)] px-11 py-3 text-xl text-white group-active:-translate-y-0.5">
						Count: <span>{count}</span>
					</span>
				</button>
			)
		}
	},
)
