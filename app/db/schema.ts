import { createId } from "@paralleldrive/cuid2"
import { sql, type SQL } from "drizzle-orm"
import * as t from "drizzle-orm/pg-core"
import { pgTable } from "drizzle-orm/pg-core"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

const createdAtModifiedAt = {
	created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
	updated_at: t
		.timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdateFn(() => sql`CURRENT_TIMESTAMP`),
}

// TODO: maybe make a user_sneakers table so we can reuse a lot of the core sneaker info
export const sneakers = pgTable("sneakers", {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => createId()),
	brand: t.text().notNull(),
	colorway: t.text().notNull(),
	model: t.text().notNull(),
	image: t.text().notNull(),
	date: t.timestamp({ withTimezone: true }).defaultNow(),
	size: t.numeric({ precision: 4, scale: 2 }).notNull(),

	price: t.integer().notNull(),

	...createdAtModifiedAt,

	user_id: t
		.varchar()
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
})

export const users = pgTable("users", {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => createId()),
	email: t.text().notNull().unique(),
	given_name: t.text().notNull(),
	family_name: t.text().notNull(),
	password: t.text().notNull(),
	username: t.text().unique().notNull(),
	password_salt: t.text().notNull(),

	// full_name: t
	// 	.varchar({ length: 255 })
	// 	.generatedAlwaysAs(
	// 		(): SQL => sql`${users.given_name} ${users.family_name}`,
	// 	),

	...createdAtModifiedAt,
})

export type User = typeof users.$inferSelect
export let insertUserSchema = createInsertSchema(users)
export let updateUserSchema = createUpdateSchema(users)

export type Sneaker = typeof sneakers.$inferSelect
export let insertSneakerSchema = createInsertSchema(sneakers).omit({
	user_id: true,
})
export let updateSneakerSchema = createUpdateSchema(sneakers).omit({
	user_id: true,
})
