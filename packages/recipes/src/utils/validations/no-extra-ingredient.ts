import { ExtraIngredientsUsedError, RecipeValidationError } from "../../models";
import type {
	Recipe,
	RecipeInputMetadata,
	RecipeValidationResult,
} from "../../types";
import { getExtraIngredients } from "../ingredients";

export const validateNoExtraIngredients = (
	recipe: Recipe,
	inputMetadata: RecipeInputMetadata,
): RecipeValidationResult<ExtraIngredientsUsedError> => {
	const extraIngredients = getExtraIngredients(recipe, inputMetadata);

	if (!extraIngredients.length) return null;

	return new RecipeValidationError(
		extraIngredients.map(
			(ingredient) => new ExtraIngredientsUsedError(ingredient),
		),
	);
};
