import { eq } from "drizzle-orm"
import type * as z from "zod"
import { schema } from "../db"
import type { Brand, insertBrandSchema } from "../db/schema"
import { env } from "../lib/env"

export async function getBrandById(id: string): Promise<Brand | null> {
	let brand = await env.db.query.brands.findFirst({
		where: eq(schema.brands.id, id),
	})

	if (!brand) return null

	return brand
}

export async function getBrandByName(name: string): Promise<Brand | null> {
	let brand = await env.db.query.brands.findFirst({
		where: eq(schema.brands.name, name),
	})

	if (!brand) return null

	return brand
}

export async function createBrand(
	input: z.infer<typeof insertBrandSchema>,
): Promise<Brand> {
	let createdBrands = await env.db
		.insert(schema.brands)
		.values({ name: input.name, slug: input.slug })
		.returning()

	let brand = createdBrands.at(0)

	if (!brand) {
		throw new Error("Failed to create brand")
	}

	return brand
}

export async function findOrCreateBrand(
	input: z.infer<typeof insertBrandSchema>,
): Promise<Brand> {
	let brand = await getBrandByName(input.name)
	if (!brand) brand = await createBrand(input)
	return brand
}
