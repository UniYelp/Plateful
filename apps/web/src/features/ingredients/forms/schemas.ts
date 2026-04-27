import z from "zod";

import {
	INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH,
	INGREDIENT_MAXIMUM_NAME_LENGTH,
	INGREDIENT_MINIMUM_NAME_LENGTH,
} from "./constants";

export const IngredientQuantitySchema = z.object({
	amount: z
		.number({ error: "Amount must be greater than 0" })
		.gt(0, "Amount must be greater than 0"),
	unit: z.string().optional(),
	expiryDate: z.string().optional(),
});

export const IngredientFormSchema = z.object({
	name: z
		.string()
		.min(INGREDIENT_MINIMUM_NAME_LENGTH)
		.max(INGREDIENT_MAXIMUM_NAME_LENGTH),
	description: z.string().max(INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH).optional(),
	category: z.string().min(1, "Please select a category"),
	quantities: z
		.array(
			z.object({
				...IngredientQuantitySchema.shape,
				amount: z.union([IngredientQuantitySchema.shape.amount, z.nan()]),
			}),
		)
		.transform((val) => {
			if (val.length === 1) {
				const first = val[0];
				if (Number.isNaN(first.amount) && !first.unit && !first.expiryDate) {
					return [];
				}
			}
			return val;
		})
		.pipe(z.array(IngredientQuantitySchema)),
});

export type IngredientFormInput = z.input<typeof IngredientFormSchema>;
export type IngredientFormOutput = z.infer<typeof IngredientFormSchema>;
