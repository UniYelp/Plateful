import { type RecipeMaterialKind, RecipeStepBlockType } from "../../enums";
import {
	RecipeValidationError,
	UnusedInputMaterialInStepError,
} from "../../models";
import type { Recipe, RecipeValidationResult } from "../../types";
import { isMaterialInputKind, isMaterialOutputKind } from "../guards";

export const validateNoUnusedInputMaterialsInStep = (
	recipe: Recipe,
): RecipeValidationResult<UnusedInputMaterialInStepError> => {
	const unusedInputMaterialsInStepsErrors = recipe.steps.flatMap(
		(step, idx) => {
			const stepInputKindMaterials = step.blocks.filter(
				(block) =>
					block.type === RecipeStepBlockType.Material &&
					isMaterialInputKind(block.kind as RecipeMaterialKind),
			);

			if (!stepInputKindMaterials.length) return [];

			const stepHasOutputKindMaterials =
				step.blocks.some(
					(block) =>
						block.type === RecipeStepBlockType.Material &&
						isMaterialOutputKind(block.kind as RecipeMaterialKind),
				) || (step.metadata?.derivedOutputs?.length ?? 0) > 0;

			if (stepHasOutputKindMaterials) return [];

			return stepInputKindMaterials.map(
				(material) =>
					new UnusedInputMaterialInStepError(material.name as string, idx),
			);
		},
	);

	if (!unusedInputMaterialsInStepsErrors.length) return null;

	return new RecipeValidationError(unusedInputMaterialsInStepsErrors);
};
