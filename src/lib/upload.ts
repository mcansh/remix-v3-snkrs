import type { FileUpload } from "@remix-run/fetch-router/form-data-middleware"
import * as z from "zod"

import { env } from "./env"

let cloudinaryUploadResponseSchema = z.object({
	secure_url: z.url(),
})

export async function uploadHandler(file: FileUpload): Promise<string> {
	// Generate unique key for this file
	let ext = file.name.split(".").pop() || "jpg"
	let key = `${file.fieldName}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

	let formData = new FormData()
	formData.append("file", file)
	formData.append("upload_preset", env.CLOUDINARY_UPLOAD_PRESET)
	formData.append("folder", "remix-v3-snkrs")
	formData.append("public_id", key)
	formData.append("invalidate", "true")

	let response = await fetch(
		`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
		{
			method: "POST",
			body: formData,
		},
	)

	let data = await response.json()
	let parsed = cloudinaryUploadResponseSchema.safeParse(data)
	if (!parsed.success) throw new Error("Invalid response from Cloudinary")

	return parsed.data.secure_url
}
