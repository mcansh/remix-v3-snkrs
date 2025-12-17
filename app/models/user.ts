import { fromBase64, verify } from "@brielov/crypto"
import { eq } from "drizzle-orm"

import { db, schema } from "#app/db/index.js"
import type { User } from "#app/db/schema.js"

export async function getUserByUsername(
	username: string,
): Promise<User | null> {
	let users = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.username, username))
		.limit(1)

	let user = users.at(0)

	return user ? user : null
}

export async function getUserById(id: string): Promise<User | null> {
	let users = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.id, id))
		.limit(1)

	let user = users.at(0)

	return user ? user : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
	let users = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.email, email))
		.limit(1)

	let user = users.at(0)

	console.log(
		user
			? `found user with id ${user.id}`
			: `no user found with email ${email}`,
	)

	return user ? user : null
}

export async function authenticateUser(
	email: string,
	password: string,
): Promise<User | null> {
	let user = await getUserByEmail(email)

	if (!user) return null

	let verified = await verify(
		password,
		fromBase64(user.password),
		fromBase64(user.password_salt),
	)

	return verified ? user : null
}

export async function generateUsername(
	potentialUsername: string,
): Promise<string> {
	let username = potentialUsername
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_+|_+$/g, "")

	//=> createUsername(" John.Doe! ") === "john_doe"

	// check if that username already exists in the database
	let existingUser = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.username, username))
		.limit(1)
	let user = existingUser.at(0)

	if (!user) return username

	// if it does, append a random 3 character string to the username
	const randomString = Math.random().toString(36).substring(2, 5)
	let newUsername = `${username}${randomString}`

	return generateUsername(newUsername)
}
