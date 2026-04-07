import { z } from "zod";

export const ExtractedIngredientSchema = z.object({
	name: z.string(),
	amount: z.number(),
	unit: z.string().optional(),
	description: z.string().optional(),
	category: z.string().optional(),
});

export type ExtractedIngredient = z.infer<typeof ExtractedIngredientSchema>;

export const ReceiptExtractionOutputSchema = z.object({
	ingredients: z.array(ExtractedIngredientSchema),
});

export type ReceiptExtractionOutput = z.infer<typeof ReceiptExtractionOutputSchema>;
