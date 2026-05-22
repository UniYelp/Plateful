import {
	RecipeMaterialKind,
	RecipeStepBlockType,
	RecipeStepPriority,
} from "../../enums";
import {
	RecipeValidationError,
	RepeatingMetadataDerivedOutputMaterialInStepError,
} from "../../models";
import type { Recipe, RecipeValidationResult } from "../../types";

export const validateNoRepeatingMetadataDerivedOutputMaterialsInSteps = (
	recipe: Recipe,
): RecipeValidationResult<RepeatingMetadataDerivedOutputMaterialInStepError> => {
	const repeatingMaterialsInStepsErrors = recipe.steps.flatMap((step, idx) => {
		if (step.metadata?.priority !== RecipeStepPriority.Mandatory) return [];

		const stepMetadataDerivedOutputMaterialNames =
			step.metadata.derivedOutputs?.map((material) => material.name);

		if (!stepMetadataDerivedOutputMaterialNames?.length) return [];

		const uniqueMetadataNames = new Set(stepMetadataDerivedOutputMaterialNames);

		const stepDerivedOutputMaterialNames = step.blocks.flatMap((block) =>
			block.type === RecipeStepBlockType.Material &&
			block.kind === RecipeMaterialKind.DerivedOutput
				? (block.name as string)
				: [],
		);

		const uniqueBlocksNames = new Set(stepDerivedOutputMaterialNames);

		const repeatingNames = uniqueMetadataNames.intersection(uniqueBlocksNames);

		if (!repeatingNames.size) return [];

		return Array.from(repeatingNames).map(
			(name) =>
				new RepeatingMetadataDerivedOutputMaterialInStepError(name, idx),
		);
	});

	if (!repeatingMaterialsInStepsErrors.length) return null;

	return new RecipeValidationError(repeatingMaterialsInStepsErrors);
};
