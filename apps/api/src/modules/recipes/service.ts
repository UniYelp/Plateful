import { RecipeAgent } from "@plateful/agents/recipes";
import type { RecipesModel } from "./model";

export const generateRecipe = async (
	body: RecipesModel.GenerateRecipeBody,
): Promise<RecipesModel.GenerateRecipeResponse> => {
	const result = await RecipeAgent.generateRecipe(body);
	const { output } = result;

	return output;
};
