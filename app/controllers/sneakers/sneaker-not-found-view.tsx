import { Document } from "#app/components/document.tsx"

export function SneakerNotFoundView() {
	return () => {
		return (
			<Document head={<title>404 Not Found</title>}>
				<h1>404 Not Found</h1>
				<p>Sorry, the sneaker you are looking for does not exist.</p>
			</Document>
		)
	}
}
