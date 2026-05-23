import { toArray } from "@plateful/utils";
import type { Recipe, RecipeInputMetadata } from "../../types";
import { getRecipeTools } from "./get-recipe-tools";

export const getExtraTools = (
	recipe: Recipe,
	inputMetadata: RecipeInputMetadata,
): null | string[] => {
	const { tools } = inputMetadata;

	if (toArray(tools).includes("unlimited")) return null;

	const inputTools = new Set(tools);
	const recipeTools = new Set(getRecipeTools(recipe));

	return Array.from(recipeTools.difference(inputTools));
};
