import type { Doc } from "./_generated/dataModel";
import type { EntityShape } from "./schema";

export type RecipeGenDoc = Doc<"recipeGens">;
export type RecipeGenShape = EntityShape<"recipeGens">;

export type RecipeGenStatus = RecipeGenShape["state"]["status"];

export type FullRecipeGenDoc = RecipeGenDoc & {
	title?: EntityShape<"recipes">["title"];
};
