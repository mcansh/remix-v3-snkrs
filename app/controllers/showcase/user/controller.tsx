import type { BuildAction } from "remix/fetch-router"

import { Document } from "#app/components/document.tsx"
import { SneakerGrid } from "#app/components/sneaker-grid.tsx"
import { render } from "#app/lib/html.tsx"
import { getAllUserSneakers } from "#app/models/sneaker.ts"
import { getUserByUsername } from "#app/models/user.ts"
import type { routes } from "#app/routes.ts"

export const sneakerUserHandler = {
	async handler({ params }) {
		let user = await getUserByUsername(params.username)

		if (user == null) {
			return render(
				<Document head={<title>User {params.username} not found</title>}>
					<h1>User {params.username} not found</h1>
				</Document>,
			)
		}

		let sneakers = await getAllUserSneakers(user.id)

		return render(
			<Document head={<title>{params.username}</title>}>
				<SneakerGrid sneakers={sneakers} username={params.username} />
			</Document>,
		)
	},
} satisfies BuildAction<"GET", typeof routes.showcase.user>
