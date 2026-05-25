import { createRecipeGraph } from "../recipe-graph";
import { recipeValidationAccumulator } from "./accumulator";
import { validateRecipeGraph } from "./recipe-graph/validate";
import { validateRecipeMisc } from "./validate";

export const validateRecipe = recipeValidationAccumulator(
	validateRecipeMisc,
	(recipe, inputMetadata) => {
		const recipeGraph = createRecipeGraph(recipe, inputMetadata);
		return validateRecipeGraph(recipeGraph);
	},
);
