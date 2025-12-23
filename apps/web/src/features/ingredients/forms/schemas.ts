import z from "zod";

import { IngredientUnit } from "@plateful/ingredients";
import {ingredientCategoriesMap } from "@/pages/dashboard/ingredients";

const INGREDIENT_MAXIMUM_NAME_LENGTH = 30;
const INGREDIENT_MINIMUM_NAME_LENGTH = 2;
const INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH = 200;
export const AddIngredientFormSchema = z.object({
	name: z.string().min(INGREDIENT_MINIMUM_NAME_LENGTH).max(INGREDIENT_MAXIMUM_NAME_LENGTH),
	description: z.string().max(INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH).optional(),
	amount: z.number().min(0),
	unit: z.enum(IngredientUnit).optional(),
	category: z.enum(ingredientCategoriesMap),
	expiryDate: z.string().optional(),
});

export type AddIngredientFormValues = z.infer<typeof AddIngredientFormSchema>;
