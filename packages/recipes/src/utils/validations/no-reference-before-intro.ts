import { RecipeMaterialKind, RecipeStepBlockType } from "../../enums";
import {
	MaterialReferencedBeforeIntroductionError,
	RecipeValidationError,
} from "../../models";
import type {
	Recipe,
	RecipeInputMetadata,
	RecipeMaterialBlock,
	RecipeValidationResult,
} from "../../types";

export const validateNoRefMaterialBeforeIntro = (
	recipe: Recipe,
	inputMetadata: RecipeInputMetadata,
): RecipeValidationResult<MaterialReferencedBeforeIntroductionError> => {
	const materials = new Set(inputMetadata.ingredients.map((ing) => ing.name));
	const issues: MaterialReferencedBeforeIntroductionError[] = [];

	for (const [stepIndex, step] of Object.entries(recipe.steps)) {
		for (const block of step.blocks) {
			if (block.type !== RecipeStepBlockType.Material) continue;

			const part = block as RecipeMaterialBlock;

			if (part.kind !== RecipeMaterialKind.Referenced) {
				materials.add(part.name);
				continue;
			}

			if (materials.has(part.name)) continue;

			issues.push(
				new MaterialReferencedBeforeIntroductionError(part.name, stepIndex),
			);
		}

		for (const derivedOutputMeta of step.metadata?.derivedOutputs ?? []) {
			materials.add(derivedOutputMeta.name);
		}
	}

	if (!issues?.length) return null;

	return new RecipeValidationError(issues);
};
