export function safeRedirect(to: FormDataEntryValue | null) {
	if (!to || typeof to !== "string") {
		return "/"
	}

	if (!to.startsWith("/") || to.startsWith("//")) {
		return "/"
	}

	return to
}
