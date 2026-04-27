import type { Recipe, RecipeInputMetadata } from "../../types";
import { getRecipeIngredients } from "./get-recipe-ingredients";

export const getExtraIngredients = (
	recipe: Recipe,
	inputMetadata: RecipeInputMetadata,
): string[] => {
	const { ingredients } = inputMetadata;

	const inputIngredients = new Set(ingredients.map((ing) => ing.name));
	const recipeIngredients = new Set(getRecipeIngredients(recipe));

	return Array.from(recipeIngredients.difference(inputIngredients));
};
