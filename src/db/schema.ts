import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

// TODO: maybe make a user_sneakers table so we can reuse a lot of the core sneaker info
export const sneakers = sqliteTable("sneakers", {
	id: text("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => createId()),
	brand: text().notNull(),
	colorway: text({ length: 255 }).notNull(),
	model: text({ length: 255 }).notNull(),
	image: text({ length: 255 }).notNull(),
	purchase_date: int({ mode: "timestamp" }),
	size: int().notNull(),
	purchase_price: int().notNull(),
	retail_price: int().notNull(),
	sold: int({ mode: "boolean" }).notNull().default(false),
	// only include soldDate and soldPrice if sold is true
	sold_date: int({ mode: "timestamp" }),
	sold_price: int(),

	created_at: int({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updated_at: int({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),

	user_id: text()
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
})

export const users = sqliteTable("users", {
	id: text("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => createId()),
	email: text({ length: 255 }).notNull().unique(),
	given_name: text({ length: 255 }).notNull(),
	family_name: text({ length: 255 }).notNull(),
	password: text({ length: 255 }).notNull(),
	username: text({ length: 255 }).notNull(),
	password_salt: text({ length: 255 }).notNull(),

	created_at: int({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updated_at: int({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
})

export const usersRelations = relations(users, ({ many }) => {
	return {
		// a user can have many sneakers
		sneakers: many(sneakers),
	}
})

export const sneakersRelations = relations(sneakers, ({ one }) => {
	return {
		// a sneaker can belong to a single user
		user: one(users, {
			fields: [sneakers.user_id],
			references: [users.id],
		}),
	}
})

export type User = typeof users.$inferSelect
export type UsersRelation = typeof usersRelations
export let insertUserSchema = createInsertSchema(users)
export let updateUserSchema = createUpdateSchema(users)

export type Sneaker = typeof sneakers.$inferSelect
export type SneakerRelation = typeof sneakersRelations
export let insertSneakerSchema = createInsertSchema(sneakers).omit({
	user_id: true,
})
export let updateSneakerSchema = createUpdateSchema(sneakers).omit({
	user_id: true,
})
