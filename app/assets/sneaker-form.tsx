import type { Remix } from "@remix-run/dom"
import { hydrated } from "@remix-run/dom"
import { dom } from "@remix-run/events"

import { RestfulForm } from "#app/components/restful-form.js"
import type { Sneaker } from "#app/db/schema.js"
import { routes } from "#app/routes.js"
import { Button } from "#app/components/ui/button.js"
import { Input } from "#app/components/ui/input.js"
import { Label } from "#app/components/ui/label.js"

export const SneakerForm = hydrated(
	routes.assets.href({ path: "sneaker-form.js#SneakerForm" }),
	function (this: Remix.Handle, { sneaker }: { sneaker?: Sneaker }) {
		let formAction = sneaker
			? routes.sneakers.update.href({ id: sneaker.id })
			: routes.sneakers.create.href()

		let imagePreview: string | null = null

		return () => (
			<div data-component="Dialog" class="min-h-screen bg-background">
				<div data-component="DialogContent" class="sm:max-w-125">
					<div data-component="DialogHeader">
						<div
							data-component="DialogTitle"
							class="text-2xl font-(family-name:--font-display)"
						>
							Add to Collection
						</div>
						<div data-component="DialogDescription">
							Enter the details of your new sneaker
						</div>
					</div>
					<RestfulForm method="post" action={formAction}>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label>Sneaker Image</Label>
								{imagePreview ? (
									<div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-border bg-secondary">
										<img
											src={imagePreview}
											alt="Sneaker preview"
											className="object-cover"
										/>
										<button
											type="button"
											// onClick={handleRemoveImage}
											className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-background"
										>
											<span>remove</span>
											{/* <X className="h-4 w-4" /> */}
										</button>
									</div>
								) : (
									<label
										htmlFor="image-upload"
										className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/50 transition-colors hover:bg-secondary"
									>
										{/* <Upload className="h-8 w-8 text-muted-foreground" /> */}
										<span className="text-sm text-muted-foreground">
											Click to upload image
										</span>
										<span className="text-xs text-muted-foreground">
											or we'll generate one for you
										</span>
									</label>
								)}
								<input
									id="image-upload"
									name="image"
									type="file"
									accept="image/*"
									className="hidden"
									on={dom.change((event) => {
										const files = event.currentTarget.files
										if (!files) return
										let file = files.item(0)
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
												imagePreview = image.src
												this.update()
											}
										}
										reader.readAsDataURL(file)
									})}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="brand">Brand</Label>
								<Input
									id="brand"
									placeholder="Nike, Adidas, New Balance..."
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="model">Model</Label>
								<Input
									id="model"
									placeholder="Air Jordan 1, Yeezy 350..."
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="colorway">Colorway</Label>
								<Input
									id="colorway"
									placeholder="Chicago, Zebra, Panda..."
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="size">Size</Label>
									<Input id="size" placeholder="10.5" required />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="price">Price ($)</Label>
									<Input
										id="price"
										type="number"
										step="0.01"
										placeholder="170.00"
										required
									/>
								</div>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="purchaseDate">Purchase Date</Label>
								<Input id="purchaseDate" type="date" required />
							</div>
						</div>
						<div data-component="DialogFooter">
							<Button type="button" variant="outline">
								Cancel
							</Button>
							<Button type="submit">Add Sneaker</Button>
						</div>
					</RestfulForm>
				</div>
			</div>
		)
	},
)
