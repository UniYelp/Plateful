import {
	RecipeValidationError,
	type RecipeValidationIssue,
} from "../../models";
import type {
	Recipe,
	RecipeInputMetadata,
	RecipeValidationResult,
} from "../../types";
import { createRecipeGraph } from "../recipe-graph";
import { validateNoExtraIngredients } from "./no-extra-ingredient";
import { validateNoExtraTools } from "./no-extra-tools";
import { validateIngredientsUsedOnlyAsInputs } from "./recipe-graph/ingredient-used-as-only-input";
import { validateNoMaterialProducedBeforeInputs } from "./recipe-graph/no-material-produced-before-inputs";
import { validateNoMaterialQuantityExceeded } from "./recipe-graph/no-material-quantity-exceeded";
import { validateNoMaterialUsedBeforeProduced } from "./recipe-graph/no-material-used-before-produced";
import { validateNoUnreachableMaterials } from "./recipe-graph/no-unreachable-materials";
import { validateUnusedDerivedMaterials } from "./recipe-graph/no-unused-derived-materials";
import { validateRecipeOutput } from "./recipe-graph/output";

export const validateRecipe = (
	recipe: Recipe,
	inputMetadata: RecipeInputMetadata,
): RecipeValidationResult => {
	const issues: RecipeValidationIssue[] = [];

	const recipeGraph = createRecipeGraph(recipe, inputMetadata);

	const hasOutputRes = validateRecipeOutput(recipeGraph);

	if (hasOutputRes) {
		issues.push(...hasOutputRes.issues);
	}

	const noUnreachableMaterialsRes = validateNoUnreachableMaterials(recipeGraph);

	if (noUnreachableMaterialsRes) {
		issues.push(...noUnreachableMaterialsRes.issues);
	}

	const ingredientUsedOnlyAsInputsRes =
		validateIngredientsUsedOnlyAsInputs(recipeGraph);

	if (ingredientUsedOnlyAsInputsRes) {
		issues.push(...ingredientUsedOnlyAsInputsRes.issues);
	}

	const noMaterialProducedBeforeInputsRes =
		validateNoMaterialProducedBeforeInputs(recipeGraph);

	if (noMaterialProducedBeforeInputsRes) {
		issues.push(...noMaterialProducedBeforeInputsRes.issues);
	}

	const noMaterialUsedBeforeProducedRes =
		validateNoMaterialUsedBeforeProduced(recipeGraph);

	if (noMaterialUsedBeforeProducedRes) {
		issues.push(...noMaterialUsedBeforeProducedRes.issues);
	}

	const unusedDerivedMaterialsRes = validateUnusedDerivedMaterials(recipeGraph);

	if (unusedDerivedMaterialsRes) {
		issues.push(...unusedDerivedMaterialsRes.issues);
	}

	const quantityExceededRes = validateNoMaterialQuantityExceeded(recipeGraph);

	if (quantityExceededRes) {
		issues.push(...quantityExceededRes.issues);
	}

	const noExtraIngredientsRes = validateNoExtraIngredients(
		recipe,
		inputMetadata,
	);

	if (noExtraIngredientsRes) {
		issues.push(...noExtraIngredientsRes.issues);
	}

	const noExtraToolsRes = validateNoExtraTools(recipe, inputMetadata);

	if (noExtraToolsRes) {
		issues.push(...noExtraToolsRes.issues);
	}

	if (!issues.length) return null;

	return new RecipeValidationError(issues);
};
