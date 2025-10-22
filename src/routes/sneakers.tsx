import { redirect, type RouteHandlers } from "@remix-run/fetch-router"
import { Cookie } from "@remix-run/headers"
import { Button } from "@remix-run/library/button"
import { decode } from "decode-formdata"
import { eq } from "drizzle-orm"
import { z } from "zod/mini"

import { Document } from "../components/document"
import { RestfulForm } from "../components/restful-form"
import { schema } from "../db"
import { env } from "../lib/env"
import { render } from "../lib/html"
import { createSneaker } from "../models/sneaker"
import { routes } from "../routes"

export const sneakerHandlers = {
	async index({ request, params }) {
		let cookie = new Cookie(request.headers.get("Cookie") ?? "")
		let userIdOrName = params.user ? params.user : cookie.get("_session")
		let sneakers = await env.db.query.sneakers.findMany({
			where: eq(schema.sneakers.user_id, userIdOrName),
		})

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
								<input type="hidden" name="id" value={sneaker.id} />
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

	async user({ params }) {
		let user = await env.db.query.users.findFirst({
			where: eq(schema.users.username, params.user),
		})

		if (!user) {
			return render(
				<Document>
					<h1>User not found</h1>
				</Document>,
				{ status: 404 },
			)
		}

		// findMany sneakers that belong to the user
		let sneakers = await env.db.query.sneakers.findMany({
			where: eq(schema.sneakers.user_id, user.id),
		})

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
								<input type="hidden" name="id" value={sneaker.id} />
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
		let data = Object.freeze({
			brand: "Vans",
			model: "Slip On",
			colorway: "Black/White Checkerboard",
			size: 10,
			image: "/lol",
			purchase_price: 60_00,
			retail_price: 60_00,
			purchase_date: new Date().toISOString(),
		})

		return render(
			<Document>
				<title>New Sneaker</title>
				<h1>New Sneaker</h1>

				<form method="post" action={routes.sneakers.create.href()}>
					{Object.entries(data).map(([key, value]) => (
						<div key={key}>
							<input type="hidden" id={key} name={key} value={String(value)} />
						</div>
					))}
					<Button type="submit">Create</Button>
				</form>
			</Document>,
		)
	},

	async create({ formData, request }) {
		let cookie = new Cookie(request.headers.get("Cookie") ?? "")

		let userId = cookie.get("_session")

		if (!userId) return redirect(routes.auth.login.index)

		try {
			let sneakerId = await createSneaker(formData, userId)
			return redirect(routes.sneakers.show.href({ id: sneakerId }))
		} catch (error) {
			console.error(error)
			return redirect(routes.sneakers.new.href())
		}
	},

	async destroy({ formData, request }) {
		let decoded = decode(formData)
		let destroySchema = z.object({ id: z.cuid2() })
		let result = destroySchema.parse(decoded)

		let cookie = new Cookie(request.headers.get("Cookie") ?? "")
		let userId = cookie.get("_session")

		if (!userId) return redirect(routes.auth.login.index)

		let deleted = await env.db
			.delete(schema.sneakers)
			.where(eq(schema.sneakers.id, result.id))

		console.log({ deleted })

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
