import type { Sneaker } from "#app/db/schema.js"

import { RestfulForm } from "#app/components/restful-form.js"
import { routes } from "#app/routes.js"
import { hydrated, type Remix } from "@remix-run/dom"
import { dom } from "@remix-run/events"

export const SneakerForm = hydrated(
	routes.assets.href({
		path: "sneaker-form.js#SneakerForm",
	}),
	function (this: Remix.Handle, { sneaker }: { sneaker?: Sneaker }) {
		let action = sneaker
			? routes.sneakers.update.href({ id: sneaker.id })
			: routes.sneakers.create.href()

		let imagePreview: HTMLImageElement | null = null

		return () => (
			<RestfulForm method={sneaker ? "put" : "post"} action={action} encType="multipart/form-data">
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
						<span class="block text-sm font-medium text-gray-700">Colorway</span>
						<input
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							type="text"
							placeholder="Anniversary Royal"
							name="colorway"
						/>
					</label>
					<label htmlFor="price">
						<span class="block text-sm font-medium text-gray-700">Price (in cents)</span>
						<input
							id="price"
							name="price"
							placeholder="12000"
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							// prefix="$"
						/>
					</label>
					<label htmlFor="retailPrice">
						<span class="block text-sm font-medium text-gray-700">Retail Price</span>
						<input
							id="retailPrice"
							name="retailPrice"
							placeholder="12000"
							class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							// prefix="$"
						/>
					</label>
					<label>
						<span class="block text-sm font-medium text-gray-700">Purchase Date</span>
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
							// on={dom.change(event => {
							//   const value = event.currentTarget.valueAsNumber
							//   // ensure the value is in a 0.5 increment
							//   const roundedValue = Math.round(value * 2) / 2
							//   event.currentTarget.value = roundedValue.toString()
							//   this.update()
							// })}
							step={0.5}
						/>
					</label>
					<label>
						<span class="block text-sm font-medium text-gray-700">Image</span>

						<div class="flex gap-2">
							<span class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm file:text-red-700">
								Choose File
							</span>

							<img src={imagePreview?.src} alt="Preview" class="" />
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
										image.src = reader.result as string
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
						{/*Add{pendingForm ? "ing" : ""} to collection*/}
						<button type="submit">{sneaker ? "Update" : "Add"} Sneaker</button>
					</button>
				</fieldset>
				{/*<fieldset>
				<legend>{sneaker ? "Edit Sneaker" : "New Sneaker"}</legend>

				<div>
					<label for="brand">Brand:</label>
					<input type="text" id="brand" name="brand" value={sneaker?.brand} />
				</div>

				<div>
					<label for="model">Model:</label>
					<input type="text" id="model" name="model" value={sneaker?.model} />
				</div>

				<div>
					<label for="colorway">Colorway:</label>
					<input type="text" id="colorway" name="colorway" value={sneaker?.colorway} />
				</div>

				<div>
					<label for="size">Size:</label>
					<input type="text" inputMode="numeric" id="size" name="size" value={sneaker?.size} />
				</div>

				<div>
					<label for="image">Image:</label>
					<input type="file" id="image" name="image" accept="image/*" value={sneaker?.image} />
				</div>

				<div>
					<label for="purchase_price">Purchase Price (in cents):</label>
					<input
						type="number"
						id="purchase_price"
						name="purchase_price"
						value={sneaker?.purchase_price ?? ""}
					/>
				</div>

				<div>
					<label for="retail_price">Retail Price (in cents):</label>
					<input
						type="number"
						id="retail_price"
						name="retail_price"
						value={sneaker?.retail_price ?? ""}
					/>
				</div>

				<div>
					<label for="purchase_date">Purchase Date:</label>
					<input
						type="date"
						id="purchase_date"
						name="purchase_date"
						value={sneaker?.purchase_date?.toISOString().split("T")[0] ?? ""}
					/>
				</div>

				<button type="submit">{sneaker ? "Update" : "Create"} Sneaker</button>
			</fieldset>*/}
			</RestfulForm>
		)
	},
)
