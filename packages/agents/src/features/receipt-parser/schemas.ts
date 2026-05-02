import { z } from "zod";

import { ingredientCategories, ingredientUnits } from "@plateful/ingredients";

export const ExtractedIngredientSchema = z.object({
	name: z.string().meta({
		description:
			"The name of the ingredient extracted from the receipt (a unique identifier). It should also include variant - e.g. if the receipt says Milk chocolate with hazelnuts 200g single, the name should be Milk chocolate with hazelnuts",
	}),
	description: z.string().optional().meta({
		description: "Any additional details like brand, size, or processing type",
	}),
	category: z.enum([...ingredientCategories, "non-edible"]).meta({
		description:
			"The category of the item. Use 'non-edible' for items that are not food ingredients (like batteries, soap, toilet paper). Use 'other' for food items that do not fit into other categories.",
	}),
	quantities: z
		.array(
			z.object({
				amount: z.number().meta({
					description:
						"The numerical amount/size of a single item (e.g., 500 for '500g').",
				}),
				unit: z.enum(ingredientUnits).optional().meta({
					description:
						"The unit of measurement. If none is found, omit or use null to imply 'one item/thing'.",
				}),
			}),
		)
		.meta({
			description:
				"List of quantities for this item. Group identical items with the same name and description here.",
		}),
});

export type ExtractedIngredient = z.infer<typeof ExtractedIngredientSchema>;

export const ReceiptExtractionOutputSchema = z.object({
	ingredients: z.array(ExtractedIngredientSchema),
});

export type ReceiptExtractionOutput = z.infer<
	typeof ReceiptExtractionOutputSchema
>;
