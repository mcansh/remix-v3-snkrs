import { redirect, type RouteHandlers } from "@remix-run/fetch-router"

import { Document } from "../components/document"
import { render } from "../lib/html"
import { createUser, login } from "../models/user"
import { routes } from "../routes"

export const registerHandlers = {
	use: [],
	handlers: {
		index() {
			return render(
				<Document>
					<form method="post" action={routes.register.action.href()}>
						{/*<input type="email" name="email" placeholder="Email" />*/}
						{/*<input type="password" name="password" placeholder="Password" />*/}
						<button type="submit">Register</button>
					</form>
				</Document>,
			)
		},

		async action({ formData }) {
			const email = formData.get("email")
			const password = formData.get("password")

			let user = await createUser({
				email: "logan@mcan.sh",
				password: "password",
				family_name: "McAnsh",
				given_name: "Logan",
				username: "logan",
			})

			return redirect(routes.home.index.href(), {
				headers: {
					"Set-Cookie": await login("password", user),
				},
			})
		},
	},
} satisfies RouteHandlers<typeof routes.register>
