import * as s from "remix/data-schema"
import { isCuid } from "@paralleldrive/cuid2"

export function isCuid2(): s.Check<string> {
	return {
		check(value) {
			return isCuid(value)
		},
		code: "string.cuid",
		message: "Expected valid CUID",
	}
}
