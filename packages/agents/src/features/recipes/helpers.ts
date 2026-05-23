import { recipeAgent } from "./agent";
import { generateRecipePrompt } from "./prompt";
import type { ExtendedRecipeGenInput } from "./schemas";

export const generateRecipe = async (input: ExtendedRecipeGenInput) => {
	const { output, text, steps } = await recipeAgent.generate({
		prompt: generateRecipePrompt(input),
	});

	return {
		output,
		text,
		steps,
	};
};
