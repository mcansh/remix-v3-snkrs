import { generateSalt, hash, toBase64 } from "@brielov/crypto"
import { redirect, type RouteHandlers } from "@remix-run/fetch-router"
import { Button } from "@remix-run/library/button"
import { decode } from "decode-formdata"
import { eq } from "drizzle-orm"

import { Document } from "../components/document"
import { RestfulForm } from "../components/restful-form"
import { schema } from "../db"
import { env } from "../lib/env"
import { render } from "../lib/html"
import { routes } from "../routes"

export const sneakerHandlers = {
	async create({ formData }) {
		let decoded = decode(formData, {
			files: ["image"],
			booleans: ["sold"],
			numbers: ["purchase_price", "sold_price", "retail_price"],
			dates: ["purchase_date", "sold_date"],
		})

		await env.db.delete(schema.users)

		const salt = generateSalt()

		let passwordHash = await hash("password", salt)

		let createdUsers = await env.db
			.insert(schema.users)
			.values({
				email: "logan@mcan.sh",
				family_name: "McAnsh",
				given_name: "Logan",
				username: "logan",
				password: toBase64(passwordHash),
				password_salt: toBase64(salt),
			})
			.returning()

		let createdUser = createdUsers.at(0)

		if (!createdUser) throw new Error("Failed to create user")

		let createdBrands = await env.db
			.insert(schema.brands)
			.values({ name: "Vans", slug: "vans" })
			.returning()

		let brand = createdBrands.at(0)

		if (!brand) throw new Error("Failed to create brand")

		let created = await env.db
			.insert(schema.sneakers)
			.values({
				colorway: "Test",
				image: "lol",
				model: "Slip On",
				brand_id: brand.id,
				purchase_date: new Date(),
				purchase_price: 60_00,
				size: 10,
				user_id: createdUser.id,
				retail_price: 60_00,
			})
			.returning()

		let sneaker = created.at(0)

		if (!sneaker) {
			throw new Error("Failed to create sneaker")
		}

		return redirect(routes.sneakers.show.href({ id: sneaker.id }))
	},

	async destroy() {
		return redirect(routes.sneakers.index.href())
	},

	edit({ params }) {
		return render(
			<Document>
				<title>Edit Sneaker</title>
				<h1>Edit Sneaker {params.id}</h1>
			</Document>,
		)
	},

	async index() {
		let sneakers = await env.db.query.sneakers.findMany()
		let users = await env.db.query.users.findMany()

		console.log({ users })

		return render(
			<Document>
				<title>Sneakers</title>
				<h1>Sneakers</h1>

				<ul>
					{sneakers.map((sneaker) => (
						<li key={sneaker.id}>
							<RestfulForm
								action={routes.sneakers.destroy.href({ id: sneaker.id })}
								method="delete"
							>
								<Button type="submit">Destroy Sneaker {sneaker.id}</Button>
							</RestfulForm>
						</li>
					))}
				</ul>

				<div class="mt-10">
					<ul>
						{sneakers.map((sneaker) => (
							<li key={sneaker.id}>
								<a href={routes.sneakers.show.href({ id: sneaker.id })}>
									Show Sneaker {sneaker.id}
								</a>
							</li>
						))}
					</ul>
				</div>
			</Document>,
		)
	},

	new() {
		return render(
			<Document>
				<title>New Sneaker</title>
				<h1>New Sneaker</h1>

				<form method="post" action={routes.sneakers.create.href()}>
					<Button type="submit">Create</Button>
				</form>
			</Document>,
		)
	},

	async show({ params }) {
		let sneaker = await env.db.query.sneakers.findFirst({
			where: eq(schema.sneakers.id, params.id),
		})

		if (!sneaker) {
			return render(
				<Document>
					<title>404 Not Found</title>
					<h1>404 Not Found</h1>
				</Document>,
				{ status: 404 },
			)
		}

		return render(
			<Document>
				<title>Show Sneaker</title>
				<div class="mt-4">
					<h1>Show Sneaker {params.id}</h1>
					<div class="mt-10">
						<pre>{JSON.stringify(sneaker, null, 2)}</pre>
					</div>
				</div>
			</Document>,
		)
	},

	update({ params }) {
		return render(
			<Document>
				<title>Update Sneaker</title>
				<h1>Update Sneaker {params.id}</h1>
			</Document>,
		)
	},
} satisfies RouteHandlers<typeof routes.sneakers>
