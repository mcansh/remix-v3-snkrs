import { decode } from "decode-formdata"
import { eq } from "drizzle-orm"
import * as z from "zod/mini"

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
			price: parsed.price,
			date: parsed.date,
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

	let parsed = insertSneakerSchema.safeParse(decoded)

	if (!parsed.success) {
		console.error(parsed.error)
		throw new Error(JSON.stringify(z.treeifyError(parsed.error)))
	}

	let result = await db
		.insert(schema.sneakers)
		.values({
			brand: parsed.data.brand,
			model: parsed.data.model,
			colorway: parsed.data.colorway,
			size: parsed.data.size,
			image: parsed.data.image,
			price: parsed.data.price,
			date: parsed.data.date,
			user_id: userId,
		})
		.returning({ id: schema.sneakers.id })

	let sneaker = result.at(0)

	if (!sneaker) {
		throw new CreateSneakerError(parsed.data)
	}

	return sneaker.id
}

type Serialize<T> = T extends Date
	? string
	: T extends object
		? { [K in keyof T]: Serialize<T[K]> }
		: T

type SerializeExtras<T> = {
	[K in keyof T]: K extends "date" | "created_at" | "updated_at" | "price"
		? string | null
		: Serialize<T[K]>
}

export async function getAllSneakers(
	userId: string,
	imageSizes: [number, number, number] = [200, 400, 600],
): Promise<Array<SerializedSneaker>> {
	let sneakers = await db
		.select()
		.from(schema.sneakers)
		.where(eq(schema.sneakers.user_id, userId))

	let sneakersWithData = sneakers.map((sneaker) => {
		return serializeSneaker(sneaker, imageSizes)
	})

	return sneakersWithData
}

export function serializeSneaker(
	sneaker: Sneaker,
	imageSizes: [number, number, number] = [200, 400, 600],
): SerializedSneaker {
	let result = generateDensitySrcSet({
		publicId: sneaker.image,
		sizes: imageSizes,
	})

	return {
		...sneaker,
		price: formatMoney(sneaker.price),
		date: sneaker.date ? formatDate(sneaker.date) : null,
		image: result.default,
		src_set: result.src_set,
		created_at: sneaker.created_at.toISOString(),
		updated_at: sneaker.updated_at.toISOString(),
	}
}

export type SerializedSneaker = SerializeExtras<Sneaker> & { src_set: string }

type SerializedSneakerOrSneaker<T> = T extends true
	? SerializedSneaker
	: Sneaker

export async function getSneakerById<T extends boolean = false>(
	id: string,
	serialize?: T,
	options: { srcSetSizes?: [number, number, number] } = {},
): Promise<SerializedSneakerOrSneaker<T> | null> {
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
