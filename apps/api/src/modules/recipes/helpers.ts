import { recipeAgent } from "./agent";
import { generateRecipePrompt } from "./prompt";
import type { RecipeInput } from "./schemas";

export const generateRecipe = async (input: RecipeInput) => {
	const {
		experimental_output: output,
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
