let moneyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
})

let dateFormat = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
})

export function formatMoney(amount: number): string {
	return moneyFormatter.format(amount / 100)
}

export function formatDate(date: number | Date): string {
	return dateFormat.format(date)
}
