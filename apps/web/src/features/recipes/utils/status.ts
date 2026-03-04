import {
	type CompletedRecipeStatus,
	CompletedRecipeStatuses,
	type FailedRecipeStatus,
	FailedRecipeStatuses,
	type GeneratingRecipeStatus,
	GeneratingRecipeStatuses,
	type RecipeGenShape,
} from "@backend/recipeGens";
import type { RecipeGenState } from "../types";

export const isGeneratingRecipe = (
	recipeGen: RecipeGenShape,
): recipeGen is RecipeGenState<GeneratingRecipeStatus> =>
	GeneratingRecipeStatuses.has(recipeGen.state.status);

export const isFailedRecipeGen = (
	recipeGen: RecipeGenShape,
): recipeGen is RecipeGenState<FailedRecipeStatus> =>
	FailedRecipeStatuses.has(recipeGen.state.status);

export const isCompletedRecipeGen = (
	recipeGen: RecipeGenShape,
): recipeGen is RecipeGenState<CompletedRecipeStatus> =>
	CompletedRecipeStatuses.has(recipeGen.state.status);
