import { RecipeStepBlockType } from "../../enums";
import type { Recipe } from "../../types";

export const getRecipeTools = (recipe: Recipe) => {
	return recipe.steps.flatMap((step) =>
		step.blocks.flatMap((block) =>
			block.type === RecipeStepBlockType.Tool ? (block.name as string) : [],
		),
	);
};
