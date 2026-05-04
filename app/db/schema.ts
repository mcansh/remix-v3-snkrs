import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import * as s from "remix/data-schema";
import * as f from "remix/data-schema/form-data";

const updatedAt = int({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date());

const createdAt = int({ mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date());

export const brands = sqliteTable("brands", {
	id: text("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text({ length: 255 }).notNull().unique(),
	slug: text({ length: 255 }).notNull().unique(),
	created_at: createdAt,
	updated_at: updatedAt,
})

export const sneakers = sqliteTable(
	"sneakers",
	{
		id: text("id", { length: 36 })
			.primaryKey()
			.$defaultFn(() => createId()),
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

		created_at: createdAt,
		updated_at: updatedAt,

		brand_id: text()
			.references(() => brands.id, { onDelete: "restrict" })
			.notNull(),

		user_id: text()
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
	},
	(table) => {
		return [index("sneakers_brand_id_idx").on(table.brand_id)]
	},
)

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

	created_at: createdAt,
	updated_at: updatedAt,
})

export const usersRelations = relations(users, ({ many }) => {
	return {
		// a user can have many sneakers
		sneakers: many(sneakers),
	}
})

export const brandsRelations = relations(brands, ({ many }) => {
  return {
    // a brand can have many sneakers
		sneakers: many(sneakers),
	}
})

export const sneakersRelations = relations(sneakers, ({ one }) => {
  return {
  	// a sneaker belongs to a single brand
		brand: one(brands, {
			fields: [sneakers.brand_id],
			references: [brands.id],
		}),
		// a sneaker belongs to a single user
		user: one(users, {
			fields: [sneakers.user_id],
			references: [users.id],
		}),
	}
})

export type User = typeof users.$inferSelect
export type UsersRelation = typeof usersRelations

export type Brand = typeof brands.$inferSelect
export type BrandsRelation = typeof brandsRelations

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
