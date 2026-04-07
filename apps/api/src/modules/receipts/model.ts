import { t } from "elysia";

export namespace ReceiptsModel {
	export const parseReceiptBody = t.Object({
		image: t.String({
			description: "Base64 encoded image or URL of the receipt",
		}),
	});

	export const parseReceiptResponse = t.Object({
		ingredients: t.Array(
			t.Object({
				name: t.String(),
				amount: t.Number(),
				unit: t.Optional(t.String()),
				description: t.Optional(t.String()),
				category: t.Optional(t.String()),
			}),
		),
	});
}
