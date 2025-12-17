import type { Remix } from "@remix-run/dom"
import { hydrated } from "@remix-run/dom"
import { dom } from "@remix-run/events"

import { RestfulForm } from "#app/components/restful-form.js"
import type { Sneaker } from "#app/db/schema.js"
import { routes } from "#app/routes.js"

export const SneakerForm = hydrated(
	routes.assets.href({ path: "sneaker-form.js#SneakerForm" }),
	function (this: Remix.Handle, { sneaker }: { sneaker?: Sneaker }) {
		let action = sneaker
			? routes.sneakers.update.href({ id: sneaker.id })
			: routes.sneakers.create.href()

		let imagePreview: HTMLImageElement | null = null

		return () => (
			<RestfulForm
				method={sneaker ? "put" : "post"}
				action={action}
				encType="multipart/form-data"
			>
				<fieldset class="w-full space-y-2 sm:grid sm:grid-cols-2 sm:items-center sm:gap-x-4 sm:gap-y-6 sm:space-y-0">
					<label>
						<span class="block text-sm font-medium text-gray-700">Brand</span>
						<input
							class="block w-full border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							type="text"
							placeholder="Nike"
							name="brand"
						/>
					</label>
					<label>
						<span class="block text-sm font-medium text-gray-700">Model</span>
						<input
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							type="text"
							placeholder="Air Max 1"
							name="model"
						/>
					</label>
					<label>
						<span class="block text-sm font-medium text-gray-700">
							Colorway
						</span>
						<input
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							type="text"
							placeholder="Anniversary Royal"
							name="colorway"
						/>
					</label>
					<label htmlFor="price">
						<span class="block text-sm font-medium text-gray-700">
							Price (in cents)
						</span>
						<input
							id="price"
							name="price"
							placeholder="12000"
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							// prefix="$"
						/>
					</label>
					<label htmlFor="retailPrice">
						<span class="block text-sm font-medium text-gray-700">
							Retail Price
						</span>
						<input
							id="retailPrice"
							name="retailPrice"
							placeholder="12000"
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							// prefix="$"
						/>
					</label>
					<label>
						<span class="block text-sm font-medium text-gray-700">
							Purchase Date
						</span>
						<input
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							type="datetime-local"
							name="purchaseDate"
						/>
					</label>
					<label>
						<span class="block text-sm font-medium text-gray-700">Size</span>
						<input
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							type="text"
							inputMode="numeric"
							placeholder="10"
							name="size"
							step={0.5}
						/>
					</label>
					<label>
						<span class="block text-sm font-medium text-gray-700">Image</span>

						<div class="flex gap-2">
							<span class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm file:text-red-700">
								Choose File
							</span>

							{imagePreview ? (
								<img src={imagePreview.src} alt="Preview" class="size-40" />
							) : null}
							<input
								type="file"
								accept="image/*"
								name="image"
								class="hidden"
								on={dom.change((event) => {
									const files = event.currentTarget.files
									if (!files) return
									let file = files[0]
									if (!file) return
									const reader = new FileReader()
									reader.onload = () => {
										const image = new Image()
										if (reader.result == null) return
										if (reader.result instanceof ArrayBuffer) {
											const uint8Array = new Uint8Array(reader.result)
											const blob = new Blob([uint8Array], { type: file.type })
											image.src = URL.createObjectURL(blob)
										} else {
											image.src = reader.result
										}

										image.onload = () => {
											imagePreview = image
											this.update()
										}
									}
									reader.readAsDataURL(file)
								})}
							/>
						</div>
					</label>
					<button
						type="submit"
						class="col-span-2 w-auto self-start rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-left text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-200"
					>
						{sneaker ? "Update" : "Add to collection"}
					</button>
				</fieldset>
			</RestfulForm>
		)
	},
)
