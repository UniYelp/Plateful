import { recipeAgent } from "./agent";
import { generateRecipePrompt } from "./prompt";
import type { RecipeGenInput } from "./schemas";

export const generateRecipe = async (input: RecipeGenInput) => {
	const {
		output,
		text,
		steps,
	} = await recipeAgent.generate({
		prompt: generateRecipePrompt(input),
	});

	return {
		output,
		text,
		steps,
	};
};
