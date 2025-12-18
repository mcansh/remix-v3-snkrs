import type { BuildAction, Controller } from "@remix-run/fetch-router"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { and, eq } from "drizzle-orm"
import * as z from "zod/mini"

import { SneakerForm } from "#app/assets/sneaker-form.js"
import { SneakerGrid } from "#app/assets/sneaker-grid.js"
import { db, schema } from "#app/db/index.js"
import { renderDocument } from "#app/lib/html.js"
import { requireAuth } from "#app/middleware/auth.js"
import {
	createSneaker,
	getSneakerById,
	serializeSneaker,
	updateSneaker,
} from "#app/models/sneaker.js"
import { routes } from "#app/routes.js"
import { getCurrentUser } from "#app/utils/context.js"
import { CollectionStats } from "#app/components/collection-stats.js"
import type { Sneaker } from "#app/db/schema.js"
import { getUserByUsername } from "#app/models/user.js"
import { formatMoney } from "#app/lib/format.js"

function sneakerUserAndIndexHandler({
	sneakers,
}: {
	sneakers: Array<Sneaker>
}) {
	let serialized = sneakers.map((sneaker) => {
		return serializeSneaker(sneaker)
	})

	const totalValue = sneakers.reduce((sum, sneaker) => sum + sneaker.price, 0)
	const formattedTotalValue = formatMoney(totalValue)
	const totalPairs = sneakers.length
	const brands = new Set(sneakers.map((s) => s.brand)).size

	return renderDocument(
		<div className="min-h-screen bg-background">
			<header className="border-b border-border">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold tracking-tight font-(family-name:--font-display)">
								SNEAKER VAULT
							</h1>
							<p className="text-muted-foreground mt-1">
								Your personal collection tracker
							</p>
						</div>
						<a
							href={routes.sneakers.new.href()}
							// onClick={() => setIsDialogOpen(true)}
							// size="lg"
							className="gap-2"
						>
							<img src="/images/plus.svg" alt="Add" class="size-5" />
							Add Sneaker
						</a>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<CollectionStats
					brandCount={brands}
					totalPairs={totalPairs}
					totalValue={formattedTotalValue}
				/>
				<SneakerGrid sneakers={serialized} />
			</main>

			{/* <AddSneakerDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onAdd={handleAddSneaker} /> */}
		</div>,
	)
}

const sneakerIndexHandler: BuildAction<"GET", typeof routes.sneakers.index> = {
	middleware: [requireAuth()],
	async action() {
		let currentUser = getCurrentUser()

		let sneakers = await db
			.select()
			.from(schema.sneakers)
			.where(eq(schema.sneakers.user_id, currentUser.id))

		return sneakerUserAndIndexHandler({ sneakers })
	},
}

const sneakerUserHandler: BuildAction<"GET", typeof routes.sneakers.user> = {
	middleware: [],
	async action({ params }) {
		let user = await getUserByUsername(params.user)

		if (!user) {
			return renderDocument(<h1>User not found</h1>, {
				status: 404,
				statusText: "Not Found",
			})
		}

		let sneakers = await db
			.select()
			.from(schema.sneakers)
			.where(eq(schema.sneakers.user_id, user.id))

		return sneakerUserAndIndexHandler({ sneakers })
	},
}

const sneakerNewHandler: BuildAction<"GET", typeof routes.sneakers.new> = {
	middleware: [requireAuth()],
	action() {
		return renderDocument(
			<>
				<title>Add a new sneaker to your collection</title>
				<SneakerForm />
			</>,
		)
	},
}

const sneakerCreateHandler: BuildAction<"POST", typeof routes.sneakers.create> =
	{
		middleware: [requireAuth()],
		async action({ formData }) {
			let user = getCurrentUser()
			let sneakerId = await createSneaker(formData, user.id)
			return createRedirectResponse(
				routes.sneakers.show.href({ id: sneakerId }),
			)
		},
	}

const sneakerDestroyHandler: BuildAction<
	"DELETE",
	typeof routes.sneakers.destroy
> = {
	middleware: [requireAuth()],
	async action({ params }) {
		let user = getCurrentUser()

		let destroySchema = z.object({ id: z.cuid2() })
		let result = destroySchema.parse(params)

		let deleted = await db
			.delete(schema.sneakers)
			.where(
				and(
					eq(schema.sneakers.id, result.id),
					eq(schema.sneakers.user_id, user.id),
				),
			)

		console.log({ deleted })

		return createRedirectResponse(routes.sneakers.index.href())
	},
}

const sneakerEditHandler: BuildAction<"GET", typeof routes.sneakers.edit> = {
	middleware: [requireAuth()],
	async action({ params }) {
		let sneaker = await getSneakerById(params.id, true)

		if (!sneaker) {
			return renderDocument(
				<>
					<title>404 Not Found</title>
					<h1>404 Not Found</h1>
					<p>Sorry, the sneaker you are looking for does not exist.</p>
				</>,
				{ status: 404 },
			)
		}

		return renderDocument(
			<>
				<title>Edit Sneaker</title>

				<SneakerForm sneaker={sneaker} />
			</>,
		)
	},
}

const sneakerShowHandler: BuildAction<"GET", typeof routes.sneakers.show> = {
	middleware: [],
	async action({ params }) {
		let sneaker = await getSneakerById(params.id, true, {
			srcSetSizes: [400, 800, 1200],
		})

		if (!sneaker) {
			return renderDocument(
				<>
					<title>404 Not Found</title>
					<h1>404 Not Found</h1>
				</>,
				{ status: 404 },
			)
		}

		return renderDocument(
			<>
				<title>Show Sneaker</title>
				<div class="mt-4">
					<h1>Show Sneaker {params.id}</h1>

					<div class="grid gap-4 md:grid-cols-3">
						<div class="col-span-2">
							<img
								src={sneaker.image}
								alt={sneaker.model}
								class="aspect-square w-full"
								srcSet={sneaker.src_set}
							/>
							<h2>Brand</h2>
							<p>{sneaker.brand}</p>
						</div>
						<div>
							<h2>Model</h2>
							<p>{sneaker.model}</p>

							<h2>Colorway</h2>
							<p>{sneaker.colorway}</p>

							<h2>Purchase Date</h2>
							<p>{sneaker.date}</p>

							<h2>Purchase Price</h2>
							<p>{sneaker.price}</p>

							<h2>Size</h2>
							<p>{sneaker.size}</p>
						</div>
					</div>

					<div class="mt-10">
						<pre>{JSON.stringify(sneaker, null, 2)}</pre>
					</div>
				</div>
			</>,
		)
	},
}

const sneakerUpdateHandler: BuildAction<"PUT", typeof routes.sneakers.update> =
	{
		middleware: [requireAuth()],
		async action({ formData, params }) {
			await updateSneaker(params.id, formData)

			return createRedirectResponse(
				routes.sneakers.show.href({ id: params.id }),
			)
		},
	}

export const sneakerHandlers = {
	new: sneakerNewHandler,
	create: sneakerCreateHandler,

	index: sneakerIndexHandler,
	show: sneakerShowHandler,
	user: sneakerUserHandler,

	edit: sneakerEditHandler,
	update: sneakerUpdateHandler,

	destroy: sneakerDestroyHandler,
} satisfies Controller<typeof routes.sneakers>
