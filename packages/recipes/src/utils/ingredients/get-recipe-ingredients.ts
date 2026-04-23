import { RecipeMaterialKind, RecipeStepBlockType } from "../../enums";
import type { Recipe } from "../../types";

export const getRecipeIngredients = (recipe: Recipe) => {
	return recipe.steps.flatMap((step) =>
		step.flatMap((block) =>
			block.type === RecipeStepBlockType.Material &&
			block.kind === RecipeMaterialKind.Input
				? (block.name as string)
				: [],
		),
	);
};
