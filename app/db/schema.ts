import * as s from "remix/data-schema"
import * as f from "remix/data-schema/form-data"
import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"

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

export type Sneaker = typeof sneakers.$inferSelect
export type SneakerRelation = typeof sneakersRelations

export const updateSneakerSchema = f.object({
	brand: f.field(s.string()),
	colorway: f.field(s.string()),
	model: f.field(s.string()),
	image: f.field(s.string()),
	purchase_date: f.field(s.number()),
	size: f.field(s.number()),
	purchase_price: f.field(s.number()),
	retail_price: f.field(s.number()),
	sold: f.field(s.boolean()),
	sold_date: f.field(s.number()),
	sold_price: f.field(s.number()),
})

export const insertSneakerSchema = f.object({
	brand: f.field(s.string()),
	colorway: f.field(s.string()),
	model: f.field(s.string()),
	image: f.field(s.string()),
	purchase_date: f.field(s.number()),
	size: f.field(s.number()),
	purchase_price: f.field(s.number()),
	retail_price: f.field(s.number()),
	sold: f.field(s.boolean()),
	sold_date: f.field(s.number()),
	sold_price: f.field(s.number()),
})
