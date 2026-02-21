import { RecipeAgent } from "@plateful/agents/recipes";
import { SafetyAgent } from "@plateful/agents/safety";
import type { RecipesModel } from "./model";

export const generateRecipe = async (
	body: RecipesModel.GenerateRecipeBody,
): Promise<RecipesModel.GenerateRecipeCompleteEventData> => {
	const result = await RecipeAgent.generateRecipe(body);
	const { output } = result;

	return output;
};

export const safetyCheck = async (
	recipe: string,
): Promise<{ score: number | null; text: string }> => {
	const result = await SafetyAgent.critiqueRecipeSafety({ recipe });
	return result;
};
