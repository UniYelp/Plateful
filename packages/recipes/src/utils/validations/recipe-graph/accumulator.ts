import {
	RecipeValidationError,
	type RecipeValidationIssue,
} from "../../../models";
import type { RecipeGraphValidatorFn } from "../../../types/validator";

export const recipeGraphValidationAccumulator = (
	...validators: RecipeGraphValidatorFn[]
): RecipeGraphValidatorFn => {
	return (recipeGraph) => {
		const issues: RecipeValidationIssue[] = [];

		for (const validation of validators) {
			const validationRes = validation(recipeGraph);

			if (validationRes?.issues.length) {
				issues.push(...validationRes.issues);
			}
		}

		if (!issues.length) return null;

		return new RecipeValidationError(issues);
	};
};
