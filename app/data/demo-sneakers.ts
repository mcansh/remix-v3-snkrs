import type { SerializedSneaker } from "#app/models/sneaker.ts";

const demoBase: Array<
	Omit<
		SerializedSneaker,
		| "id"
		| "user_id"
		| "created_at"
		| "updated_at"
		| "srcSet"
		| "purchase_date"
		| "sold"
		| "sold_date"
		| "sold_price"
	>
> = [
	{
		brand: "Jordan",
		brand_slug: "jordan",
		brand_id: "",
		model: "Air Jordan 1 Retro High OG",
		colorway: "Chicago (Lost and Found)",
		image: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
		size: 10,
		purchase_price: "$180.00",
		retail_price: "$180.00",
	},
	{
		brand: "Nike",
		brand_slug: "nike",
		brand_id: "",
		model: "Dunk Low",
		colorway: "Panda",
		image: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
		size: 9,
		purchase_price: "$110.00",
		retail_price: "$110.00",
	},
	{
		brand: "New Balance",
		brand_slug: "new-balance",
		brand_id: "",
		model: "550",
		colorway: "White/Team Red",
		image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
		size: 9,
		purchase_price: "$110.00",
		retail_price: "$110.00",
	},
	{
		brand: "adidas",
		brand_slug: "adidas",
		brand_id: "",
		model: "Samba OG",
		colorway: "White/Black",
		image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782",
		size: 8,
		purchase_price: "$100.00",
		retail_price: "$100.00",
	},
	{
		brand: "ASICS",
		brand_slug: "asics",
		brand_id: "",
		model: "GEL-Kayano 14",
		colorway: "Silver/Black",
		image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
		size: 10,
		purchase_price: "$150.00",
		retail_price: "$150.00",
	},
	{
		brand: "Salomon",
		brand_slug: "salomon",
		brand_id: "",
		model: "XT-6",
		colorway: "Black/White",
		image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782",
		size: 11,
		purchase_price: "$200.00",
		retail_price: "$200.00",
	},
	{
		brand: "Puma",
		brand_slug: "puma",
		brand_id: "",
		model: "Suede Classic",
		colorway: "Peacoat/White",
		image: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
		size: 9,
		purchase_price: "$70.00",
		retail_price: "$70.00",
	},
	{
		brand: "Reebok",
		brand_slug: "reebok",
		brand_id: "",
		model: "Club C 85",
		colorway: "Chalk/Green",
		image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782",
		size: 8,
		purchase_price: "$90.00",
		retail_price: "$90.00",
	},
	{
		brand: "Vans",
		brand_slug: "vans",
		brand_id: "",
		model: "Old Skool",
		colorway: "Black/White",
		image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
		size: 10,
		purchase_price: "$65.00",
		retail_price: "$65.00",
	},
	{
		brand: "Converse",
		brand_slug: "converse",
		brand_id: "",
		model: "Chuck 70",
		colorway: "Parchment",
		image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782",
		size: 9,
		purchase_price: "$85.00",
		retail_price: "$85.00",
	},
]

const demoDates = [
	"Jan 14, 2024",
	"Feb 3, 2024",
	"Mar 22, 2024",
	"Apr 9, 2024",
	"May 3, 2024",
	"Jun 18, 2024",
	"Jul 7, 2024",
	"Aug 29, 2024",
	"Sep 16, 2024",
	"Oct 12, 2024",
	"Nov 5, 2024",
	"Dec 20, 2024",
]

export function getDemoSneakers(
	userId: string,
	count = 10,
): Array<SerializedSneaker> {
	let now = new Date().toISOString()

	return Array.from({ length: count }, (_, index) => {
		let base = demoBase[index % demoBase.length]
		let date = demoDates[index % demoDates.length]
		let id = `demo-${base.brand.toLowerCase().replace(/\s+/g, "-")}-${index + 1}`

		return {
			id,
			brand: base.brand,
			brand_slug: base.brand_slug,
			brand_id: base.brand_id,
			model: base.model,
			colorway: base.colorway,
			image: base.image,
			srcSet: `${base.image}?w=200 1x, ${base.image}?w=400 2x, ${base.image}?w=600 3x`,
			size: base.size,
			purchase_price: base.purchase_price,
			retail_price: base.retail_price,
			purchase_date: date,
			sold: false,
			sold_date: null,
			sold_price: null,
			user_id: userId,
			created_at: now,
			updated_at: now,
		}
	})
}
