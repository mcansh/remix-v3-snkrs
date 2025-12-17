import type { SerializedSneaker } from "#app/models/sneaker.js"
import { Card } from "./ui/card.js"

export function EmptyState() {
	return (
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<div class="text-6xl mb-4">
				<span role="img" aria-label="Sneaker">
					👟
				</span>
			</div>
			<h3 class="text-xl font-semibold mb-2">No sneakers yet</h3>
			<p class="text-muted-foreground">
				Start building your collection by adding your first pair
			</p>
		</div>
	)
}

type SneakerCardProps = {
	sneaker: SerializedSneaker
}

export function SneakerCard({ sneaker }: SneakerCardProps) {
	return (
		<Card class="overflow-hidden bg-card border-border group hover:border-primary/50 transition-colors">
			<div class="aspect-square bg-secondary/50 overflow-hidden">
				<img
					src={sneaker.image || "/placeholder.svg"}
					alt={`${sneaker.brand} ${sneaker.model}`}
					class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				/>
			</div>
			<div class="p-4">
				<div class="flex items-start justify-between mb-2">
					<div class="flex-1">
						<div class="text-xs text-muted-foreground uppercase tracking-wider mb-1">
							{sneaker.brand}
						</div>
						<h3 class="font-semibold text-lg leading-tight mb-1">
							{sneaker.model}
						</h3>
						<div class="text-sm text-muted-foreground">{sneaker.colorway}</div>
					</div>
					{/* <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove sneaker?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {sneaker.model} from your collection?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(sneaker.id)}>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> */}
				</div>
				<div class="flex items-center justify-between mt-4 pt-4 border-t border-border">
					<div>
						<div class="text-xs text-muted-foreground">Size</div>
						<div class="font-semibold">{sneaker.size}</div>
					</div>
					<div class="text-right">
						<div class="text-xs text-muted-foreground">Price</div>
						<div class="font-semibold text-primary">{sneaker.price}</div>
					</div>
				</div>
			</div>
		</Card>
	)
}
