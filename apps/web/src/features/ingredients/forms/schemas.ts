import z from "zod";

import { IngredientUnit } from "@plateful/ingredients";
import {ingredientCategoriesMap } from "@/pages/dashboard/ingredients";
export const AddIngredientFormSchema = z.object({
	name: z.string().min(2).max(30),
	description: z.string().max(200).optional(),
	amount: z.number().min(0),
	unit: z.enum(IngredientUnit).optional(),
	category: z.enum(ingredientCategoriesMap),
	expiryDate: z.string().optional(),
});

export type AddIngredientFormValues = z.infer<typeof AddIngredientFormSchema>;
