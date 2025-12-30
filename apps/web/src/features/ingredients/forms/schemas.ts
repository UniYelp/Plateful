import z from "zod";

import {
	INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH,
	INGREDIENT_MAXIMUM_NAME_LENGTH,
	INGREDIENT_MINIMUM_NAME_LENGTH,
} from "./constants";

export const IngredientFormSchema = z.object({
	name: z
		.string()
		.min(INGREDIENT_MINIMUM_NAME_LENGTH)
		.max(INGREDIENT_MAXIMUM_NAME_LENGTH),
	description: z.string().max(INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH).optional(),
	amount: z.number().gt(0),
	unit: z.string().nonempty().optional(),
	category: z.string().nonempty(),
	expiryDate: z.string().nonempty().optional(),
});

export type IngredientFormValues = z.infer<typeof IngredientFormSchema>;
