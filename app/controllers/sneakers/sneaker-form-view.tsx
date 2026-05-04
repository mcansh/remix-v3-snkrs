import { RestfulForm } from "#app/components/restful-form.tsx"
import type { Sneaker } from "#app/db/schema.ts"
import { routes } from "#app/routes.ts"

import type { SneakerFormErrors, SneakerFormValues } from "./controller.ts"

export function SneakerForm<T extends boolean>() {
	return ({
		sneaker,
		isEditing,
		action,
		formErrors,
		formValues,
	}: {
		sneaker?: T extends true ? Sneaker : never
		isEditing: T
		action: string
		formErrors?: SneakerFormErrors
		formValues?: SneakerFormValues
	}) => {
		return (
			<div class="mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_oklch(0.2_0.03_250/0.08)]">
				<h1 class="text-2xl font-semibold text-slate-900">
					{isEditing ? "Edit Sneaker" : "Add Sneaker"}
				</h1>
				<p class="mt-1 text-sm text-slate-600">
					{isEditing
						? "Update the details for this pair in your collection."
						: "Add a new pair to your collection."}
				</p>

				{formErrors?.general ? (
					<div class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
						{formErrors.general}
					</div>
				) : null}

				<RestfulForm
					method={isEditing ? "put" : "post"}
					action={action}
					encType="multipart/form-data"
					class="mt-5 grid gap-4 md:grid-cols-2"
				>
					<label class="grid gap-1.5 text-sm text-slate-700" for="brand">
						Brand
						<input
							type="text"
							id="brand"
							name="brand"
							required
							defaultValue={formValues?.brand ?? sneaker?.brand}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.brand ? (
							<span class="text-xs text-rose-700">{formErrors.brand}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="model">
						Model
						<input
							type="text"
							id="model"
							name="model"
							required
							defaultValue={formValues?.model ?? sneaker?.model}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.model ? (
							<span class="text-xs text-rose-700">{formErrors.model}</span>
						) : null}
					</label>

					<label
						class="grid gap-1.5 text-sm text-slate-700 md:col-span-2"
						for="colorway"
					>
						Colorway
						<input
							type="text"
							id="colorway"
							name="colorway"
							required
							defaultValue={formValues?.colorway ?? sneaker?.colorway}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.colorway ? (
							<span class="text-xs text-rose-700">{formErrors.colorway}</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="size">
						Size
						<input
							type="number"
							inputMode="numeric"
							id="size"
							name="size"
							required
							defaultValue={formValues?.size ?? sneaker?.size}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.size ? (
							<span class="text-xs text-rose-700">{formErrors.size}</span>
						) : null}
					</label>

					<label
						class="grid gap-1.5 text-sm text-slate-700"
						for="purchase_date"
					>
						Purchase Date
						<input
							type="date"
							id="purchase_date"
							name="purchase_date"
							required
							defaultValue={
								formValues?.purchase_date ??
								sneaker?.purchase_date?.toISOString().split("T")[0] ??
								""
							}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.purchase_date ? (
							<span class="text-xs text-rose-700">
								{formErrors.purchase_date}
							</span>
						) : null}
					</label>

					<label
						class="grid gap-1.5 text-sm text-slate-700"
						for="purchase_price"
					>
						Purchase Price (in cents)
						<input
							type="number"
							id="purchase_price"
							name="purchase_price"
							required
							min={0}
							defaultValue={
								formValues?.purchase_price ?? sneaker?.purchase_price ?? ""
							}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.purchase_price ? (
							<span class="text-xs text-rose-700">
								{formErrors.purchase_price}
							</span>
						) : null}
					</label>

					<label class="grid gap-1.5 text-sm text-slate-700" for="retail_price">
						Retail Price (in cents)
						<input
							type="number"
							id="retail_price"
							name="retail_price"
							required
							min={0}
							defaultValue={
								formValues?.retail_price ?? sneaker?.retail_price ?? ""
							}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.retail_price ? (
							<span class="text-xs text-rose-700">
								{formErrors.retail_price}
							</span>
						) : null}
					</label>

					<label
						class="grid gap-1.5 text-sm text-slate-700 md:col-span-2"
						for="image"
					>
						Image
						<input
							type="file"
							id="image"
							name="image"
							accept="image/*"
							required={isEditing ? undefined : true}
							class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
						/>
						{formErrors?.image ? (
							<span class="text-xs text-rose-700">{formErrors.image}</span>
						) : null}
						{isEditing ? (
							<p class="text-xs text-slate-500">
								Leave empty to keep the existing image.
							</p>
						) : null}
					</label>

					<div class="mt-1 flex items-center gap-2 md:col-span-2">
						<button
							type="submit"
							class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
						>
							{isEditing ? "Update Sneaker" : "Create Sneaker"}
						</button>
						<a
							href={routes.sneakers.index.href()}
							class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:border-slate-400 hover:text-slate-900"
						>
							Cancel
						</a>
					</div>
				</RestfulForm>
			</div>
		)
	}
}
