import { ExtraToolsUsedError, RecipeValidationError } from "../../models";
import type {
	Recipe,
	RecipeInputMetadata,
	RecipeValidationResult,
} from "../../types";
import { getExtraTools } from "../tools";

export const validateNoExtraTools = (
	recipe: Recipe,
	inputMetadata: RecipeInputMetadata,
): RecipeValidationResult<ExtraToolsUsedError> => {
	const extraTools = getExtraTools(recipe, inputMetadata);

	if (!extraTools?.length) return null;

	return new RecipeValidationError(
		extraTools.map((tool) => new ExtraToolsUsedError(tool)),
	);
};
