import { Card } from "#app/components/ui/card.js"

type CollectionStatsProps = {
	totalValue: string
	totalPairs: number
	brandCount: number
}

export function CollectionStats({
	totalValue,
	totalPairs,
	brandCount,
}: CollectionStatsProps) {
	return (
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
			<Card class="p-6 bg-card border-border">
				<div class="text-sm text-muted-foreground uppercase tracking-wide mb-2">
					Total Pairs
				</div>
				<div class="text-3xl font-bold font-(family-name:--font-display)">
					{totalPairs}
				</div>
			</Card>

			<Card class="p-6 bg-card border-border">
				<div class="text-sm text-muted-foreground uppercase tracking-wide mb-2">
					Total Value
				</div>
				<div class="text-3xl font-bold font-(family-name:--font-display)">
					{totalValue}
				</div>
			</Card>

			<Card class="p-6 bg-card border-border">
				<div class="text-sm text-muted-foreground uppercase tracking-wide mb-2">
					Brands
				</div>
				<div class="text-3xl font-bold font-(family-name:--font-display)">
					{brandCount}
				</div>
			</Card>
		</div>
	)
}
