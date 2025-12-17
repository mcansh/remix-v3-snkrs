import { defineRelations } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"

import { env } from "#app/lib/env.js"
import * as schema from "./schema.js"

export * as schema from "./schema.js"

const relations = defineRelations(schema, (r) => ({
	users: {
		sneakers: r.many.sneakers({
			from: r.users.id,
			to: r.sneakers.user_id,
		}),
	},
}))

export const db = drizzle(env.DATABASE_URL, {
	logger: true,
	relations,
	schema,
})
