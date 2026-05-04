import { decode } from "decode-formdata"
import { and, asc, desc, eq, sql } from "drizzle-orm"
import * as s from "remix/data-schema"

import { schema } from "#app/db/index.ts"
import type { Brand, Sneaker } from "#app/db/schema.ts"
import { insertSneakerSchema, updateSneakerSchema } from "#app/db/schema.ts"
import { env } from "#app/env.ts"
import { generateDensitySrcSet } from "#app/lib/asset.ts"
import { formatDate, formatMoney } from "#app/lib/format.ts"

function slugifyBrand(brand: string): string {
	return brand.trim().toLowerCase().replace(/\s+/g, "-")
}

async function findOrCreateBrandIdByName(brand: string): Promise<string> {
	let normalizedName = brand.trim()
	let slug = slugifyBrand(normalizedName)

	let existing = await env.db.query.brands.findFirst({
		where: eq(schema.brands.slug, slug),
		columns: { id: true },
	})

	if (existing) return existing.id

	try {
		let inserted = await env.db
			.insert(schema.brands)
			.values({
				name: normalizedName,
				slug,
			})
			.returning({ id: schema.brands.id })

		let brandRow = inserted.at(0)
		if (brandRow) return brandRow.id
	} catch {
		let raced = await env.db.query.brands.findFirst({
			where: eq(schema.brands.slug, slug),
			columns: { id: true },
		})

		if (raced) return raced.id
	}

	throw new Error(`Failed to resolve brand id for ${normalizedName}`)
}

export async function getBrandBySlug(brandSlug: string) {
	return env.db.query.brands.findFirst({
		where: eq(schema.brands.slug, slugifyBrand(brandSlug)),
	})
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
	let brandId = await findOrCreateBrandIdByName(parsed.brand)

	let result = await env.db
		.update(schema.sneakers)
		.set({
			brand_id: brandId,
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
	let brandId = await findOrCreateBrandIdByName(parsed.brand)

	let result = await env.db
		.insert(schema.sneakers)
		.values({
			brand_id: brandId,
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

export type SneakerWithBrand = Sneaker & { brand: Brand | null }

export async function getAllSneakers(
	userId: string,
	imageSizes: [number, number, number] = [200, 400, 600],
): Promise<ReadonlyArray<SerializedSneaker>> {
	let sneakers = await env.db.query.sneakers.findMany({
		where: eq(schema.sneakers.user_id, userId),
		with: {
			brand: true,
		},
	})

	let sneakersWithData = sneakers.map((sneaker) => {
		return serializeSneaker(sneaker, imageSizes)
	})

	return Object.freeze(sneakersWithData)
}

export function serializeSneaker(
	sneaker: SneakerWithBrand,
	imageSizes: [number, number, number] = [200, 400, 600],
) {
	let { brand: brandRelation, ...rawSneaker } = sneaker
	let result = generateDensitySrcSet({
		publicId: rawSneaker.image,
		sizes: imageSizes,
	})
	let brandName = brandRelation?.name ?? "Unknown"
	let brandSlug = brandRelation?.slug ?? ""

	return Object.freeze({
		...rawSneaker,
		brand: brandName,
		brand_slug: brandSlug,
		purchase_price: formatMoney(rawSneaker.purchase_price),
		retail_price: formatMoney(rawSneaker.retail_price),
		sold_price: rawSneaker.sold_price
			? formatMoney(rawSneaker.sold_price)
			: null,
		purchase_date: rawSneaker.purchase_date
			? formatDate(rawSneaker.purchase_date)
			: null,
		sold_date: rawSneaker.sold_date ? formatDate(rawSneaker.sold_date) : null,
		image: result.default,
		srcSet: result.srcSet,
		created_at: rawSneaker.created_at.toISOString(),
		updated_at: rawSneaker.updated_at.toISOString(),
	})
}

export type SerializedSneaker = ReturnType<typeof serializeSneaker>

type SerializedSneakerOrSneaker<T> = T extends true
	? SerializedSneaker
	: SneakerWithBrand

export async function getSneakerById<T extends boolean = false>(
	id: string,
	serialize?: T,
	options: { srcSetSizes?: [number, number, number] } = {},
): Promise<SerializedSneakerOrSneaker<T> | null> {
	if (serialize === true) {
		let sneaker = await env.db.query.sneakers.findFirst({
			where: eq(schema.sneakers.id, id),
			with: {
				brand: true,
			},
		})

		if (!sneaker) return null

		return serializeSneaker(
			sneaker,
			options.srcSetSizes,
		) as SerializedSneakerOrSneaker<T>
	}

	let sneaker = await env.db.query.sneakers.findFirst({
		where: eq(schema.sneakers.id, id),
		with: {
			brand: true,
		},
	})

	if (!sneaker) return null

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
	let brandSlug = filters.brand ?? null
	let sort = filters.sort ?? "desc"
	let page = filters.page ?? 1
	let perPage = filters.perPage ?? 12

	let conditions = [eq(schema.sneakers.user_id, userId)]
	let selectedBrandId: string | null = null

	if (brandSlug) {
		let brandRecord = await env.db.query.brands.findFirst({
			where: eq(schema.brands.slug, slugifyBrand(brandSlug)),
			columns: { id: true },
		})

		if (!brandRecord) {
			return {
				sneakers: [],
				total: 0,
				page,
				perPage,
				totalPages: 0,
			}
		}

		selectedBrandId = brandRecord.id
	}

	if (status === "owned") {
		conditions.push(eq(schema.sneakers.sold, false))
	} else if (status === "sold") {
		conditions.push(eq(schema.sneakers.sold, true))
	}

	if (selectedBrandId) {
		conditions.push(eq(schema.sneakers.brand_id, selectedBrandId))
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
		with: {
			brand: true,
		},
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
	let result = await env.db
		.select({
			brand: schema.brands.name,
			brand_slug: schema.brands.slug,
		})
		.from(schema.sneakers)
		.innerJoin(schema.brands, eq(schema.sneakers.brand_id, schema.brands.id))
		.where(eq(schema.sneakers.user_id, userId))
		.groupBy(schema.brands.id, schema.brands.name, schema.brands.slug)
		.orderBy(asc(schema.brands.name))

	return Object.freeze(result)
}
