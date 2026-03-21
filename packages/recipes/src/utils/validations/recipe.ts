import {
	RecipeValidationError,
	type RecipeValidationIssue,
} from "../../models";
import type { Recipe, RecipeValidationResult } from "../../types";
import { createRecipeGraph } from "../recipe-graph";
import { validateIngredientsUsedOnlyAsInputs } from "./recipe-graph/ingredient-used-as-only-input";
import { validateNoMaterialProducedBeforeInputs } from "./recipe-graph/no-material-produced-before-inputs";
import { validateNoMaterialQuantityExceeded } from "./recipe-graph/no-material-quantity-exceeded";
import { validateNoMaterialUsedBeforeProduced } from "./recipe-graph/no-material-used-before-produced";
import { validateNoUnreachableMaterials } from "./recipe-graph/no-unreachable-materials";
import { validateUnusedDerivedMaterials } from "./recipe-graph/no-unused-derived-materials";
import { validateRecipeOutput } from "./recipe-graph/output";

export const validateRecipe = (recipe: Recipe): RecipeValidationResult => {
	const issues: RecipeValidationIssue[] = [];

	const recipeGraph = createRecipeGraph(recipe);

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

	if (!issues.length) return null;

	return new RecipeValidationError(issues);
};
