import { RecipeStepPriority } from "../../../enums";
import {
	HealthPriorityStepContainsIrrelevantMetadataFieldError,
	RecipeValidationError,
} from "../../../models";
import type { Recipe, RecipeValidationResult } from "../../../types";
import type { RecipeValidatorFn } from "../../../types/validator";

export const validateNoIrrelevantHealthPriorityStepMetadataFields = (
	recipe: Recipe,
): RecipeValidationResult<HealthPriorityStepContainsIrrelevantMetadataFieldError> => {
	const healthSteps = recipe.steps.filter(
		(step) => step.metadata?.priority === RecipeStepPriority.Health,
	);

	const issues: HealthPriorityStepContainsIrrelevantMetadataFieldError[] = [];

	for (const [index, healthStep] of Object.entries(healthSteps)) {
		const { derivedOutputs, waste } = healthStep.metadata ?? {};

		if (waste?.length || derivedOutputs?.length) {
			issues.push(
				new HealthPriorityStepContainsIrrelevantMetadataFieldError(index),
			);
		}
	}

	if (!issues?.length) return null;

	return new RecipeValidationError(issues);
};

validateNoIrrelevantHealthPriorityStepMetadataFields satisfies RecipeValidatorFn;
