import { decode } from "decode-formdata"
import { eq } from "drizzle-orm"
import * as z from "zod"

import { schema } from "../db"
import { insertSneakerSchema } from "../db/schema"
import { generateDensitySrcSet } from "../lib/asset"
import { env } from "../lib/env"
import { formatDate, formatMoney } from "../lib/format"

export class CreateSneakerError extends Error {
	sneaker: z.output<typeof insertSneakerSchema>
	constructor(sneaker: z.output<typeof insertSneakerSchema>) {
		super(`Failed to create sneaker`)
		this.name = "CreateSneakerError"
		this.sneaker = sneaker
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

	let result = await env.db
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

export async function getAllSneakers(
	userId: string,
	imageSizes: [number, number, number] = [200, 400, 600],
) {
	let sneakers = await env.db.query.sneakers.findMany({
		where: eq(schema.sneakers.user_id, userId),
	})

	let sneakersWithData = sneakers.map((sneaker) => {
		let result = generateDensitySrcSet({
			publicId: sneaker.image,
			sizes: imageSizes,
		})

		return {
			...sneaker,
			purchase_price: formatMoney(sneaker.purchase_price),
			purchase_date: sneaker.purchase_date
				? formatDate(sneaker.purchase_date)
				: null,
			sold_date: sneaker.sold_date ? formatDate(sneaker.sold_date) : null,
			image: result.default,
			srcSet: result.srcSet,
		}
	})

	return Object.freeze(sneakersWithData)
}
