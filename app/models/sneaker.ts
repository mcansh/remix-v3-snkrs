import * as z from "zod/mini"
import { decode } from "decode-formdata"
import { eq } from "drizzle-orm"

import { db, schema } from "#app/db/index.js"
import type { Sneaker } from "#app/db/schema.js"
import { insertSneakerSchema, updateSneakerSchema } from "#app/db/schema.js"
import { generateDensitySrcSet } from "#app/lib/asset.js"
import { formatDate, formatMoney } from "#app/lib/format.js"

export class CreateSneakerError extends Error {
	sneaker: z.output<typeof insertSneakerSchema>
	constructor(sneaker: z.output<typeof insertSneakerSchema>) {
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

	let parsed = updateSneakerSchema.parse(decoded)

	let result = await db
		.update(schema.sneakers)
		.set({
			brand: parsed.brand,
			model: parsed.model,
			colorway: parsed.colorway,
			size: parsed.size,
			image: parsed.image,
			purchase_price: parsed.purchase_price,
			retail_price: parsed.retail_price,
			purchase_date: parsed.purchase_date,
			sold: parsed.sold,
			sold_date: parsed.sold_date,
			sold_price: parsed.sold_price,
		})
		.where(eq(schema.sneakers.id, id))
		.returning()

	let sneaker = result.at(0)

	if (!sneaker) {
		throw new Error(`Failed to update sneaker`)
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

	let parsed = insertSneakerSchema.parse(decoded)

	let result = await db
		.insert(schema.sneakers)
		.values({
			brand: parsed.brand,
			model: parsed.model,
			colorway: parsed.colorway,
			size: parsed.size,
			image: parsed.image,
			purchase_price: parsed.purchase_price,
			retail_price: parsed.retail_price,
			user_id: userId,
			purchase_date: parsed.purchase_date,
		})
		.returning({ id: schema.sneakers.id })

	let sneaker = result.at(0)

	if (!sneaker) {
		throw new CreateSneakerError(parsed)
	}

	return sneaker.id
}

type Serialize<T> = T extends Date
	? string
	: T extends object
		? { [K in keyof T]: Serialize<T[K]> }
		: T

type SerializeExtras<T> = {
	[K in keyof T]: K extends `${string}_date` | `${string}_price`
		? string | null
		: Serialize<T[K]>
}

export async function getAllSneakers(
	userId: string,
	imageSizes: [number, number, number] = [200, 400, 600],
): Promise<ReadonlyArray<SerializedSneaker>> {
	// let sneakers = await db.query.sneakers.findMany({
	// 	where: eq(schema.sneakers.user_id, userId),
	// })

	let sneakers = await db
		.select()
		.from(schema.sneakers)
		.where(eq(schema.sneakers.user_id, userId))

	let sneakersWithData = sneakers.map((sneaker) => {
		return serializeSneaker(sneaker, imageSizes)
	})

	return Object.freeze(sneakersWithData)
}

export function serializeSneaker(
	sneaker: Sneaker,
	imageSizes: [number, number, number] = [200, 400, 600],
): SerializedSneaker {
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

export type SerializedSneaker = SerializeExtras<Sneaker> & { srcSet: string }

type SerializedSneakerOrSneaker<T> = T extends true
	? SerializedSneaker
	: Sneaker

export async function getSneakerById<T extends boolean = false>(
	id: string,
	serialize?: T,
	options: { srcSetSizes?: [number, number, number] } = {},
): Promise<SerializedSneakerOrSneaker<T> | null> {
	// let sneaker = await db.query.sneakers.findFirst({
	// 	where: eq(schema.sneakers.id, id),
	// })
	let sneakers = await db
		.select()
		.from(schema.sneakers)
		.where(eq(schema.sneakers.id, id))
		.limit(1)
	let sneaker = sneakers.at(0)

	if (!sneaker) return null

	if (serialize === true) {
		return serializeSneaker(
			sneaker,
			options.srcSetSizes,
		) as SerializedSneakerOrSneaker<T>
	}

	return sneaker as SerializedSneakerOrSneaker<T>
}
