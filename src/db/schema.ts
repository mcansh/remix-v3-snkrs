import { relations } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

// TODO: maybe make a user_sneakers table so we can reuse a lot of the core sneaker info
export const sneakers = sqliteTable("sneakers", {
	id: text("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
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

	brand_id: text()
		.references(() => brands.id, { onDelete: "cascade" })
		.notNull(),
	user_id: text()
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
})

export const brands = sqliteTable("brands", {
	id: text("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text({ length: 255 }).notNull().unique(),
	slug: text({ length: 255 }).notNull().unique(),

	created_at: int({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updated_at: int({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
})

export const settings = sqliteTable("settings", {
	id: text("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	show_prices: int({ mode: "boolean" }).notNull().default(false),
	user_id: text()
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),

	created_at: int({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updated_at: int({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
})

export const users = sqliteTable("users", {
	id: text("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
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

export const usersRelations = relations(users, ({ one, many }) => {
	return {
		// a user can have many sneakers
		sneakers: many(sneakers),

		// a user can have a single settings object
		// cascade delete
		settings: one(settings, {
			fields: [users.id],
			references: [settings.user_id],
		}),
	}
})

export const settingsRelations = relations(settings, ({ one }) => {
	return {
		user: one(users, {
			fields: [settings.user_id],
			references: [users.id],
		}),
	}
})

export const sneakersRelations = relations(sneakers, ({ one }) => {
	return {
		// a sneaker can belong to a single brand
		brand: one(brands, {
			fields: [sneakers.brand_id],
			references: [brands.id],
		}),

		// a sneaker can belong to a single user
		user: one(users, {
			fields: [sneakers.user_id],
			references: [users.id],
		}),
	}
})

export const brandsRelations = relations(brands, ({ many }) => {
	return {
		sneakers: many(sneakers),
	}
})

export type User = typeof users.$inferSelect
export type UsersRelation = typeof usersRelations
export let insertUserSchema = createInsertSchema(users)
export let updateUserSchema = createUpdateSchema(users)

export type Sneaker = typeof sneakers.$inferSelect
export type SneakerRelation = typeof sneakersRelations
export let insertSneakerSchema = createInsertSchema(sneakers)
export let updateSneakerSchema = createUpdateSchema(sneakers)

export type Brand = typeof brands.$inferSelect
export let insertBrandSchema = createInsertSchema(brands)
export let updateBrandSchema = createUpdateSchema(brands)

export type Setting = typeof settings.$inferSelect
export type SettingRelation = typeof settingsRelations
export let insertSettingSchema = createInsertSchema(settings)
export let updateSettingSchema = createUpdateSchema(settings)
