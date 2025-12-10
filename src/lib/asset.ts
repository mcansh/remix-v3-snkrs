import type {
    TransformerOption,
    TransformerVideoOption,
} from "@mcansh/cld-apis-types"
import { buildImageUrl, extractPublicId } from "@mcansh/cloudinary-build-url"

import { env } from "./env"

export function generateAssetUrl(
	publicIdOrUrl: string,
	transformations?: TransformerOption | TransformerVideoOption,
): string {
	let publicId = URL.canParse(publicIdOrUrl)
		? extractPublicId(publicIdOrUrl)
		: publicIdOrUrl

	return buildImageUrl(publicId, {
		cloud: { cloudName: env.CLOUDINARY_CLOUD_NAME, secure: true },
		transformations: {
			fetchFormat: "auto",
			quality: "auto",
			...transformations,
		},
	})
}

export function generateDensitySrcSet({
	publicId: publicIdOrUrl,
	sizes,
	transformations,
}: {
	publicId: string
	sizes: [number, number, number]
	transformations?: TransformerOption | TransformerVideoOption
}): {
	default: string
	srcSet: string
} {
	transformations ??= {}
	transformations.resize ??= {}

	let publicId = /^https?:\/\/[^/]+\/publicIdOrUrl/.test(publicIdOrUrl)
		? extractPublicId(publicIdOrUrl)
		: publicIdOrUrl

	let srcSet = sizes
		.toSorted((a, b) => a - b)
		.map((size) => {
			return generateAssetUrl(publicId, {
				...transformations,
				resize: { ...transformations.resize, width: size },
			})
		})

	let defaultSrc = srcSet.at(1)

	if (!defaultSrc) {
		throw new Error("No default source found")
	}

	return {
		default: defaultSrc,
		srcSet: srcSet.map((url, index) => `${url} ${index + 1}x`).join(", "),
	}
}
