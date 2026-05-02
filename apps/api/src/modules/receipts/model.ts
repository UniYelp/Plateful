import { t } from "elysia";

import { ReceiptExtractionOutputSchema } from "@plateful/agents/receipt-parser";

export namespace ReceiptsModel {
	export const parseReceiptQuery = t.Object({
		householdId: t.String(),
		keepOriginalLanguage: t.Optional(t.Boolean()),
	});

	export const parseReceiptBody = t.Object({
		image: t.File({
			type: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
		}),
	});

	export const parseReceiptResponse = ReceiptExtractionOutputSchema;
}
