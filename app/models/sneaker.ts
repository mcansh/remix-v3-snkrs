import slugify from "@sindresorhus/slugify";
import { asc, eq, sql } from "drizzle-orm";

import { schema } from "#app/db/index.ts";
import type { Brand, Sneaker } from "#app/db/schema.ts";
import { env } from "#app/env.ts";

export async function getBrandBySlug(brandSlug: string) {
	return env.db.query.brands.findFirst({
		where: eq(schema.brands.slug, slugify(brandSlug)),
	})
}

export type SneakerWithBrand = Sneaker & { brand: Brand }

export async function getAllUserSneakers(
	user_id: string,
): Promise<Array<SneakerWithBrand>> {
	return await env.db.query.sneakers.findMany({
		where: eq(schema.sneakers.user_id, user_id),
		orderBy: asc(schema.sneakers.purchase_date),
		with: { brand: true },
	})
}

export async function getSneakerById(
	id: string,
): Promise<SneakerWithBrand | undefined> {
	return await env.db.query.sneakers.findFirst({
		where: eq(schema.sneakers.id, id),
		with: { brand: true },
	})
}

export type BrandFilterOption = {
	name: string
	slug: string
	count: number
}

export async function getBrandsForUser(
	userId: string,
): Promise<Array<BrandFilterOption>> {
	let result = await env.db
		.select({
			name: schema.brands.name,
			slug: schema.brands.slug,
			count: sql<number>`count(*)`,
		})
		.from(schema.sneakers)
		.innerJoin(schema.brands, eq(schema.sneakers.brand_id, schema.brands.id))
		.where(eq(schema.sneakers.user_id, userId))
		.groupBy(schema.brands.id, schema.brands.name, schema.brands.slug)
		.orderBy(asc(schema.brands.name))

	return result
}

export async function deleteSneaker(sneaker_id: string, user_id: string) {
	console.warn(
		`Deleting sneaker ${sneaker_id} for user ${user_id}`,
		`but not sending user_id in the query`,
	)
	return await env.db
		.delete(schema.sneakers)
		.where(eq(schema.sneakers.id, sneaker_id))
		.returning()
}
