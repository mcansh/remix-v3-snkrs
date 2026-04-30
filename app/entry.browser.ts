import { run } from "remix/ui"

const app = run({
	async loadModule(moduleUrl, exportName) {
		let mod = await import(/* @vite-ignore */ moduleUrl)

		if (!(exportName in mod)) {
			throw new Error(`Module ${moduleUrl} does not export ${exportName}`)
		}

		if (typeof mod[exportName] !== "function") {
			throw new Error(
				`Module ${moduleUrl} export ${exportName} is not a function`,
			)
		}

		return mod[exportName]
	},
	async resolveFrame(src) {
		let response = await fetch(new URL(src, location.href))
		return await response.text()
	},
})

app.ready().catch((error) => {
	console.error("Frame adoption failed:", error)
})

if (import.meta.hot) {
	import.meta.hot.accept()
}
