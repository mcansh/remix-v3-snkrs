import { decode } from "decode-formdata"
import { and, asc, desc, eq, sql } from "drizzle-orm"
import * as s from "remix/data-schema"

import { schema } from "#app/db/index.ts"
import type { Sneaker } from "#app/db/schema.ts"
import { insertSneakerSchema, updateSneakerSchema } from "#app/db/schema.ts"
import { env } from "#app/env.ts"
import { generateDensitySrcSet } from "#app/lib/asset.ts"
import { formatDate, formatMoney } from "#app/lib/format.ts"

function slugifyBrand(brand: string): string {
	return brand.trim().toLowerCase().replace(/\s+/g, "-")
}

export class CreateSneakerError extends Error {
	sneaker: s.InferOutput<typeof insertSneakerSchema>
	constructor(sneaker: s.InferOutput<typeof insertSneakerSchema>) {
		super(`Failed to create sneaker`)
		this.name = "CreateSneakerError"
		this.sneaker = sneaker
	}
}

export async function updateSneaker(
	id: string,
	formData: FormData,
): Promise<void> {
	let decoded = decode(formData, {
		files: ["image"],
		booleans: ["sold"],
		numbers: ["purchase_price", "retail_price", "size", "sold_price"],
		dates: ["purchase_date", "sold_date"],
	})

	let parsed = s.parse(updateSneakerSchema, decoded)

	let result = await env.db
		.update(schema.sneakers)
		.set({
			brand: parsed.brand,
			brand_slug: slugifyBrand(parsed.brand),
			model: parsed.model,
			colorway: parsed.colorway,
			size: parsed.size,
			image: parsed.image,
			purchase_price: parsed.purchase_price,
			retail_price: parsed.retail_price,
			purchase_date: new Date(parsed.purchase_date),
			sold: parsed.sold,
			sold_date: new Date(parsed.sold_date),
			sold_price: parsed.sold_price,
		})
		.where(eq(schema.sneakers.id, id))

	if (result.error) {
		throw new Error(`Failed to update sneaker with id ${id}`)
	}
}

export async function createSneaker(
	formData: FormData,
	userId: string,
): Promise<string> {
	let decoded = decode(formData, {
		files: ["image"],
		booleans: ["sold"],
		numbers: ["purchase_price", "retail_price", "size", "sold_price"],
		dates: ["purchase_date", "sold_date"],
	})

	let parsed = s.parse(insertSneakerSchema, decoded)

	let result = await env.db
		.insert(schema.sneakers)
		.values({
			brand: parsed.brand,
			brand_slug: slugifyBrand(parsed.brand),
			model: parsed.model,
			colorway: parsed.colorway,
			size: parsed.size,
			image: parsed.image,
			purchase_price: parsed.purchase_price,
			retail_price: parsed.retail_price,
			user_id: userId,
			purchase_date: new Date(parsed.purchase_date),
		})
		.returning({ id: schema.sneakers.id })

	let sneaker = result.at(0)

	if (!sneaker) {
		throw new CreateSneakerError(parsed)
	}

	return sneaker.id
}

export async function getAllSneakers(
	userId: string,
	imageSizes: [number, number, number] = [200, 400, 600],
): Promise<ReadonlyArray<SerializedSneaker>> {
	let sneakers = await env.db.query.sneakers.findMany({
		where: eq(schema.sneakers.user_id, userId),
	})

	let sneakersWithData = sneakers.map((sneaker) => {
		return serializeSneaker(sneaker, imageSizes)
	})

	return Object.freeze(sneakersWithData)
}

export function serializeSneaker(
	sneaker: Sneaker,
	imageSizes: [number, number, number] = [200, 400, 600],
) {
	let result = generateDensitySrcSet({
		publicId: sneaker.image,
		sizes: imageSizes,
	})

	return Object.freeze({
		...sneaker,
		purchase_price: formatMoney(sneaker.purchase_price),
		retail_price: formatMoney(sneaker.retail_price),
		sold_price: sneaker.sold_price ? formatMoney(sneaker.sold_price) : null,
		purchase_date: sneaker.purchase_date
			? formatDate(sneaker.purchase_date)
			: null,
		sold_date: sneaker.sold_date ? formatDate(sneaker.sold_date) : null,
		image: result.default,
		srcSet: result.srcSet,
		created_at: sneaker.created_at.toISOString(),
		updated_at: sneaker.updated_at.toISOString(),
	})
}

export type SerializedSneaker = ReturnType<typeof serializeSneaker>

type SerializedSneakerOrSneaker<T> = T extends true
	? SerializedSneaker
	: Sneaker

export async function getSneakerById<T extends boolean = false>(
	id: string,
	serialize?: T,
	options: { srcSetSizes?: [number, number, number] } = {},
): Promise<SerializedSneakerOrSneaker<T> | null> {
	let sneaker = await env.db.query.sneakers.findFirst({
		where: eq(schema.sneakers.id, id),
	})

	if (!sneaker) return null

	if (serialize === true) {
		return serializeSneaker(
			sneaker,
			options.srcSetSizes,
		) as SerializedSneakerOrSneaker<T>
	}

	return sneaker as SerializedSneakerOrSneaker<T>
}

export interface ShowcaseFilters {
	status?: "owned" | "sold" | "all"
	brand?: string | null
	sort?: "asc" | "desc"
	page?: number
	perPage?: number
}

export interface ShowcaseResult {
	sneakers: ReadonlyArray<SerializedSneaker>
	total: number
	page: number
	perPage: number
	totalPages: number
}

export interface BrandFilterOption {
	brand: string
	brand_slug: string
}

export async function getSneakersForShowcase(
	userId: string,
	filters: ShowcaseFilters = {},
	imageSizes: [number, number, number] = [200, 400, 600],
): Promise<ShowcaseResult> {
	let status = filters.status ?? "all"
	let brand = filters.brand ?? null
	let sort = filters.sort ?? "desc"
	let page = filters.page ?? 1
	let perPage = filters.perPage ?? 12

	let conditions = [eq(schema.sneakers.user_id, userId)]

	if (status === "owned") {
		conditions.push(eq(schema.sneakers.sold, false))
	} else if (status === "sold") {
		conditions.push(eq(schema.sneakers.sold, true))
	}

	if (brand) {
		conditions.push(eq(schema.sneakers.brand_slug, slugifyBrand(brand)))
	}

	let whereClause = and(...conditions)

	let countResult = await env.db
		.select({ count: sql<number>`count(*)` })
		.from(schema.sneakers)
		.where(whereClause)

	let total = countResult.at(0)?.count ?? 0
	let totalPages = Math.ceil(total / perPage)

	let sneakers = await env.db.query.sneakers.findMany({
		where: whereClause,
		orderBy:
			sort === "desc"
				? [desc(schema.sneakers.purchase_date)]
				: [asc(schema.sneakers.purchase_date)],
		limit: perPage,
		offset: (page - 1) * perPage,
	})

	let serialized = sneakers.map((sneaker) =>
		serializeSneaker(sneaker, imageSizes),
	)

	return {
		sneakers: serialized,
		total,
		page,
		perPage,
		totalPages,
	}
}

export async function getBrandsForUser(
	userId: string,
): Promise<ReadonlyArray<BrandFilterOption>> {
	try {
		let result = await env.db
			.select({
				brand: schema.sneakers.brand,
				brand_slug: schema.sneakers.brand_slug,
			})
			.from(schema.sneakers)
			.where(eq(schema.sneakers.user_id, userId))
			.groupBy(schema.sneakers.brand, schema.sneakers.brand_slug)
			.orderBy(asc(schema.sneakers.brand))

		return Object.freeze(result)
	} catch {
		let fallback = await env.db
			.select({ brand: schema.sneakers.brand })
			.from(schema.sneakers)
			.where(eq(schema.sneakers.user_id, userId))
			.groupBy(schema.sneakers.brand)
			.orderBy(asc(schema.sneakers.brand))

		return Object.freeze(
			fallback.map((entry) => ({
				brand: entry.brand,
				brand_slug: entry.brand.trim().toLowerCase().replace(/\s+/g, "-"),
			})),
		)
	}
}
