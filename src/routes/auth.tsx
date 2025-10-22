import {
	fromBase64,
	generateSalt,
	hash,
	toBase64,
	verify,
} from "@brielov/crypto"
import { redirect, type RouteHandlers } from "@remix-run/fetch-router"
import { SetCookie } from "@remix-run/headers"
import { decode } from "decode-formdata"
import { eq } from "drizzle-orm"
import { z } from "zod/mini"

import { Document } from "../components/document"
import { RestfulForm } from "../components/restful-form"
import { schema } from "../db"
import { env } from "../lib/env"
import { render } from "../lib/html"
import { routes } from "../routes"

export const authHandlers = {
	use: [],
	handlers: {
		login: {
			async action({ formData }) {
				let loginSchema = z.object({
					email: z.email(),
					password: z.string(),
				})

				let decoded = decode(formData)

				let result = loginSchema.safeParse(decoded)

				if (!result.success) {
					console.error(result.error)
					return redirect(routes.auth.register.index)
				}

				let user = await env.db.query.users.findFirst({
					where: eq(schema.users.email, result.data.email),
				})

				if (!user || !user.password) {
					console.error("User not found")
					return redirect(routes.auth.register.index)
				}

				let verified = await verify(
					result.data.password,
					fromBase64(user.password),
					fromBase64(user.password_salt),
				)

				if (!verified) {
					console.error("invalid email or password")
					return redirect(routes.auth.login.index)
				}

				let headers = new Headers()

				headers.append(
					"Set-Cookie",
					new SetCookie({
						httpOnly: true,
						path: "/",
						maxAge: 60 * 60 * 24 * 30, // 30 days
						name: "_session",
						value: user.id,
						sameSite: "Strict",
						secure: import.meta.env.PROD ? true : undefined,
					}).toString(),
				)

				return redirect(routes.home.index, { headers })
			},
			index() {
				return render(
					<Document>
						<RestfulForm method="post" action={routes.auth.login.action.href()}>
							<input type="hidden" name="email" value="logan+new@mcan.sh" />
							<input
								type="hidden"
								name="password"
								value="mypasswordisbetterthanyours"
							/>

							<button type="submit">Login</button>
						</RestfulForm>
					</Document>,
				)
			},
		},

		register: {
			async action({ formData }) {
				const salt = generateSalt()

				let registerSchema = z.object({
					email: z.email(),
					username: z.string(),
					password: z.string().check(z.minLength(8)),
					confirm_password: z.string().check(z.minLength(8)),
					given_name: z.string(),
					family_name: z.string(),
				})

				let decoded = decode(formData)

				let result = registerSchema.safeParse(decoded)

				if (!result.success) {
					console.error(result.error)
					return redirect(routes.auth.register.index)
				}

				if (result.data.password !== result.data.confirm_password) {
					console.error("Passwords do not match")
					return redirect(routes.auth.register.index)
				}

				let passwordHash = await hash(result.data.password, salt)
				let createdUsers = await env.db
					.insert(schema.users)
					.values({
						email: result.data.email,
						family_name: result.data.family_name,
						given_name: result.data.given_name,
						username: result.data.username,
						password: toBase64(passwordHash),
						password_salt: toBase64(salt),
					})
					.returning({ id: schema.users.id })

				let createdUser = createdUsers.at(0)

				if (!createdUser) {
					console.error("Failed to create user")
					return redirect(routes.auth.register.index)
				}

				let headers = new Headers()

				headers.append(
					"Set-Cookie",
					new SetCookie({
						httpOnly: true,
						path: "/",
						maxAge: 60 * 60 * 24 * 30, // 30 days
						name: "_session",
						value: createdUser.id,
						sameSite: "Strict",
						secure: import.meta.env.PROD ? true : undefined,
					}).toString(),
				)

				return redirect(routes.home.index, { headers })
			},
			index() {
				return render(
					<Document>
						<title>Hello, World!</title>
						<h1>Hello, World!</h1>

						<RestfulForm
							method="post"
							action={routes.auth.register.action.href()}
						>
							<input type="hidden" name="email" value="logan+new@mcan.sh" />
							<input type="hidden" name="username" value="logan+new" />
							<input
								type="hidden"
								name="password"
								value="mypasswordisbetterthanyours"
							/>
							<input
								type="hidden"
								name="confirm_password"
								value="mypasswordisbetterthanyours"
							/>
							<input type="hidden" name="given_name" value="Logan" />
							<input type="hidden" name="family_name" value="McAnsh" />

							<button type="submit">Register</button>
						</RestfulForm>
					</Document>,
				)
			},
		},
	},
} satisfies RouteHandlers<typeof routes.auth>
