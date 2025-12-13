import { generateSalt, hash, verify } from "@brielov/crypto"
import { SetCookie } from "@remix-run/headers"
import type * as z from "zod"
import { schema } from "../db"
import type { insertUserSchema, User } from "../db/schema"
import { env } from "../lib/env"

export async function login(password: string, user: User): Promise<string> {
	let uint8Password = new TextEncoder().encode(user.password)
	let uint8Salt = new TextEncoder().encode(user.password_salt)
	let passwordMatch = await verify(password, uint8Password, uint8Salt)

	if (!passwordMatch) {
		throw new Error("invalid username or password")
	}

	let cookie = new SetCookie()
	cookie.name = "_session"
	cookie.value = user.id
	cookie.maxAge = 60 * 60 * 24 * 7 // 7 days
	cookie.path = "/"
	cookie.httpOnly = true
	cookie.sameSite = "Strict"
	if (import.meta.env.PROD) cookie.secure = true

	return cookie.toString()
}

export async function createUser(
	input: Omit<z.output<typeof insertUserSchema>, "password_salt">,
): Promise<Omit<User, "password" | "password_salt">> {
	const salt = generateSalt()

	let passwordHash = await hash(input.password, salt)
	let decodedSalt = new TextDecoder().decode(salt)
	let password = new TextDecoder().decode(passwordHash)

	let createdUsers = await env.db
		.insert(schema.users)
		.values({
			email: input.email,
			family_name: input.family_name,
			given_name: input.given_name,
			username: input.username,
			password,
			password_salt: decodedSalt,
		})
		.returning()

	let createdUser = createdUsers.at(0)

	if (!createdUser) {
		throw new Error("Failed to create user")
	}

	return createdUser
}
