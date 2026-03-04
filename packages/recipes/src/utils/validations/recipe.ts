import {
	RecipeValidationError,
	type RecipeValidationIssue,
} from "../../models";
import type { Recipe, RecipeValidationResult } from "../../types";
import { createRecipeGraph } from "../recipe-graph";
import { validateNoUnreachableMaterials } from "./recipe-graph/no-unreachable-materials";
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

	if (!issues.length) return null;

	return new RecipeValidationError(issues);
};
