import type { Controller } from "@remix-run/fetch-router"
import { createRedirectResponse } from "@remix-run/response/redirect"
import { decode } from "decode-formdata"
import * as z from "zod/mini"

import { Document } from "#app/components/document.js"
import { RestfulForm } from "#app/components/restful-form.js"
import { render } from "#app/lib/html.js"
import { authenticateUser } from "#app/models/user.js"
import { routes } from "#app/routes.js"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#app/components/ui/card.js"
import { Label } from "#app/components/ui/label.js"
import { Input } from "#app/components/ui/input.js"
import { Button } from "#app/components/ui/button.js"
import { safeRedirect } from "#app/lib/redirect.js"

export const loginHandlers = {
	middleware: [],
	actions: {
		async action({ formData, session, url }) {
			let returnTo = safeRedirect(url.searchParams.get("returnTo"))

			let loginSchema = z.object({
				email: z.email(),
				password: z.string(),
			})

			let decoded = decode(formData)

			let result = loginSchema.safeParse(decoded)

			if (!result.success) {
				console.error(result.error)
				return createRedirectResponse(
					routes.auth.login.index.href(undefined, {
						returnTo,
					}),
				)
			}

			let user = await authenticateUser(result.data.email, result.data.password)

			if (!user) {
				session.flash("error", "Invalid email or password. Please try again.")
				return createRedirectResponse(
					routes.auth.login.index.href(undefined, {
						returnTo,
					}),
				)
			}

			session.set("userId", user.id)

			return createRedirectResponse(returnTo || routes.home.href())
		},

		async index({ url, session }) {
			let returnTo = url.searchParams.get("returnTo")
			let error = session.get("error")

			let urlWithReturnTo = routes.auth.login.action.href(undefined, {
				returnTo,
			})

			return render(
				<Document>
					<div className="min-h-screen flex items-center justify-center bg-background p-4">
						<div className="w-full max-w-md">
							<div className="mb-8 text-center">
								<h1 className="font-mono text-4xl font-bold text-foreground mb-2">
									SNEAKER VAULT
								</h1>
								<p className="text-muted-foreground">
									Log in to access your collection
								</p>
							</div>

							<Card class="border-border bg-card">
								<CardHeader class="space-y-1">
									<CardTitle class="text-2xl font-bold">Welcome back</CardTitle>
									<CardDescription>
										Enter your credentials to access your vault
									</CardDescription>
								</CardHeader>

								<CardContent>
									<RestfulForm
										class="space-y-4"
										action={urlWithReturnTo}
										method="post"
									>
										<div class="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												placeholder="kicks@example.com"
												name="email"
												class="bg-secondary border-border"
											/>
										</div>
										<div class="space-y-2">
											<div class="flex items-center justify-between">
												<Label htmlFor="password">Password</Label>
												<button
													type="button"
													class="text-xs text-muted-foreground hover:text-primary transition-colors"
												>
													Forgot password?
												</button>
											</div>
											<Input
												id="password"
												type="password"
												placeholder="••••••••"
												class="bg-secondary border-border"
												name="password"
											/>
										</div>

										<Button
											type="submit"
											class="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
										>
											Log in
										</Button>
									</RestfulForm>
								</CardContent>
							</Card>

							<p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href={routes.auth.register.index.href()} className="text-primary hover:underline font-medium">
            Sign up
          </a>
        </p>
						</div>
					</div>
				</Document>,
			)
		},
	},
} satisfies Controller<typeof routes.auth.login>
