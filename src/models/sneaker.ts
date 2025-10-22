import { decode } from "decode-formdata"
import * as z from "zod"

import { schema } from "../db"
import { insertSneakerSchema } from "../db/schema"
import { env } from "../lib/env"

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
