import type { FN } from "@plateful/types";
import type { Recipe, RecipeInputMetadata } from "./recipe";
import type { RecipeGraph } from "./recipe-graph";
import type { RecipeValidationResult } from "./validation-result";

export type RecipeValidatorFn = FN<
	RecipeValidationResult,
	[recipe: Recipe, inputMetadata: RecipeInputMetadata]
>;

export type RecipeGraphValidatorFn = FN<
	RecipeValidationResult,
	[recipeGraph: RecipeGraph]
>;
