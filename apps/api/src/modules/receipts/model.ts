import { t } from "elysia";

export namespace ReceiptsModel {
	export const parseReceiptBody = t.Object({
		image: t.File({
			type: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
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
