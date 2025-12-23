import type { ValueOf } from "@plateful/types";
import type { RecipeGenShape } from "@backend/recipeGens";

// TODO: move to @plateful/types
type UnNest<T, K extends keyof T> = ValueOf<{
	[U in K & PropertyKey]: ValueOf<{
		[V in T[U] as string]: Omit<T, U> & { [P in U]: V };
	}>;
}>;

export type RecipeGenState<
	Status extends RecipeGenShape["state"]["status"],
	Gen extends RecipeGenShape = RecipeGenShape,
> = Extract<
	UnNest<Gen, "state">,
	{ state: Extract<Gen["state"], { status: Status }> }
>;

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
