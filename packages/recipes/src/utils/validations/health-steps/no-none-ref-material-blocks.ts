import {
	RecipeMaterialKind,
	RecipeStepBlockType,
	RecipeStepPriority,
} from "../../../enums";
import {
	NonRefMaterialBlockInHealthPriorityStepError,
	RecipeValidationError,
} from "../../../models";
import type {
	Recipe,
	RecipeMaterialBlock,
	RecipeValidationResult,
} from "../../../types";
import type { RecipeValidatorFn } from "../../../types/validator";

export const validateNoNoneRefMaterialBlocksInHealthSteps = (
	recipe: Recipe,
): RecipeValidationResult<NonRefMaterialBlockInHealthPriorityStepError> => {
	const healthSteps = recipe.steps.filter(
		(step) => step.metadata?.priority === RecipeStepPriority.Health,
	);

	const issues: NonRefMaterialBlockInHealthPriorityStepError[] = [];

	for (const [index, healthStep] of Object.entries(healthSteps)) {
		for (const block of healthStep.blocks) {
			if (block.type !== RecipeStepBlockType.Material) {
				continue;
			}
			const part = block as RecipeMaterialBlock;

			if (part.kind === RecipeMaterialKind.Referenced) {
				continue;
			}

			issues.push(
				new NonRefMaterialBlockInHealthPriorityStepError(part.name, index),
			);
		}
	}

	if (!issues?.length) return null;

	return new RecipeValidationError(issues);
};

validateNoNoneRefMaterialBlocksInHealthSteps satisfies RecipeValidatorFn;
