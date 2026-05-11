import {
	fromBase64,
	generateSalt,
	hash,
	toBase64,
	verify,
} from "@brielov/crypto"
import { eq } from "drizzle-orm"

import { schema } from "#app/db/index.ts"
import type { User } from "#app/db/schema.ts"
import { env } from "#app/env.ts"

export async function getUserById(id: string): Promise<User | null> {
	let user = await env.db.query.users.findFirst({
		where: eq(schema.users.id, id),
	})

	return user ? user : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
	let user = await env.db.query.users.findFirst({
		where: eq(schema.users.email, email),
	})

	return user ? user : null
}

export async function getUserByUsername(
	username: string,
): Promise<User | null> {
	let user = await env.db.query.users.findFirst({
		where: eq(schema.users.username, username),
	})

	return user ? user : null
}

export type CreateUserInput = {
	email: string
	username: string
	given_name: string
	family_name: string
	password: string
}

export async function createUser(input: CreateUserInput): Promise<User | null> {
	let salt = generateSalt()
	let passwordHash = await hash(input.password, salt)

	let createdUsers = await env.db
		.insert(schema.users)
		.values({
			email: input.email,
			family_name: input.family_name,
			given_name: input.given_name,
			username: input.username,
			password: toBase64(passwordHash),
			password_salt: toBase64(salt),
		})
		.returning()

	let createdUser = createdUsers.at(0)

	return createdUser ?? null
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
