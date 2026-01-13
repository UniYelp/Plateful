import type { IngredientFormOutput } from "./schemas";

export const INGREDIENT_MAXIMUM_NAME_LENGTH = 30;
export const INGREDIENT_MINIMUM_NAME_LENGTH = 2;
export const INGREDIENT_MAXIMUM_DESCRIPTION_LENGTH = 200;

export const addIngredientFormDefaultValues: IngredientFormOutput = {
	name: "",
	amount: NaN,
	category: "",
};
