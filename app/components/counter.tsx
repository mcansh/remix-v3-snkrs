import { clientEntry, on, type Handle } from "remix/ui"

export const Counter = clientEntry(
	import.meta.url,
	function Counter(handle: Handle) {
		let count = 0

		const pressIncrement = on<HTMLButtonElement>("pointerdown", () => {
			count++
			handle.update()
		})

		return () => {
			return (
				<button
					mix={pressIncrement}
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
