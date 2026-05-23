import {
	RecipeValidationError,
	type RecipeValidationIssue,
} from "../../models";
import type { RecipeValidatorFn } from "../../types/validator";

export const recipeValidationAccumulator = (
	...validators: RecipeValidatorFn[]
): RecipeValidatorFn => {
	return (recipe, inputMetadata) => {
		const issues: RecipeValidationIssue[] = [];

		for (const validation of validators) {
			const validationRes = validation(recipe, inputMetadata);

			if (validationRes?.issues.length) {
				issues.push(...validationRes.issues);
			}
		}

		if (!issues.length) return null;

		return new RecipeValidationError(issues);
	};
};
