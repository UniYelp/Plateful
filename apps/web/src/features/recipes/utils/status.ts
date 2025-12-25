import type { RecipeGenShape } from "@backend/recipeGens";
import type { RecipeGenState } from "../types";

export const isGeneratingRecipe = (
	recipeGen: RecipeGenShape,
): recipeGen is RecipeGenState<"pending" | "generating"> =>
	recipeGen.state.status === "pending" ||
	recipeGen.state.status === "generating";

export const isFailedRecipeGen = (
	recipeGen: RecipeGenShape,
): recipeGen is RecipeGenState<"failed"> => recipeGen.state.status === "failed";

export const isCompletedRecipeGen = (
	recipeGen: RecipeGenShape,
): recipeGen is RecipeGenState<"completed"> =>
	recipeGen.state.status === "completed";
