import { fromBase64, verify } from "@brielov/crypto"
import { eq } from "drizzle-orm"

import { db, schema } from "#app/db/index.js"
import type { User } from "#app/db/schema.js"

export async function getUserById(id: string): Promise<User | null> {
	// let user = await db.query.users.findFirst({
	// 	where: eq(schema.users.id, id),
	// })

	let users = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.id, id))
		.limit(1)

	let user = users.at(0)

	return user ? user : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
	// let user = await db.query.users.findFirst({
	// 	where: eq(schema.users.email, email),
	// })

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
