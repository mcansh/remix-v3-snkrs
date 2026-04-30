import { fromBase64, verify } from "@brielov/crypto"
import { eq } from "drizzle-orm"

import { schema } from "#app/db/index.ts"
import type { User } from "#app/db/schema.ts"
import { env } from "#app/lib/env.ts"

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

export async function authenticateUser(
	email: string,
	password: string,
): Promise<User | undefined> {
	let user = await getUserByEmail(email)

	if (!user) return undefined

	let verified = await verify(
		password,
		fromBase64(user.password),
		fromBase64(user.password_salt),
	)

	return verified ? user : undefined
}
