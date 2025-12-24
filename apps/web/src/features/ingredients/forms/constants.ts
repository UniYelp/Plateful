import { ingredientUnits } from "@plateful/ingredients";
import type { AddIngredientFormValues } from "./schemas";
import { ingredientCategoriesMap } from "@/pages/dashboard/ingredients";

export const addIngredientFormDefaultValues: AddIngredientFormValues = {
	name: "",
	description: "",
	amount: 1,
	unit: ingredientUnits[0],
	category: ingredientCategoriesMap[0],
	expiryDate: "",
	// image: null as File | null,
};
