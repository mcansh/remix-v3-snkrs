import * as t from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { sql } from "drizzle-orm"
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
		.varchar("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	brand: t.varchar().notNull(),
	colorway: t.varchar({ length: 255 }).notNull(),
	model: t.varchar({ length: 255 }).notNull(),
	image: t.varchar({ length: 255 }).notNull(),
	purchase_date: t.timestamp({ withTimezone: true }),
	size: t.integer().notNull(),
	purchase_price: t.integer().notNull(),
	retail_price: t.integer().notNull(),
	sold: t.boolean().notNull().default(false),
	// only include soldDate and soldPrice if sold is true
	sold_date: t.timestamp({ withTimezone: true }),
	sold_price: t.integer(),

	...createdAtModifiedAt,

	user_id: t
		.varchar()
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
})

export const users = pgTable("users", {
	id: t
		.varchar("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	email: t.varchar({ length: 255 }).notNull().unique(),
	given_name: t.varchar({ length: 255 }).notNull(),
	family_name: t.varchar({ length: 255 }).notNull(),
	password: t.varchar({ length: 255 }).notNull(),
	username: t.varchar({ length: 255 }).notNull(),
	password_salt: t.varchar({ length: 255 }).notNull(),

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
