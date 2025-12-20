import type z from "zod";

import {
	type RecipeInput,
	RecipeInputSchema,
	RecipeOutputSchema,
} from "@plateful/agents/recipes";

export namespace RecipesModel {
	export const generateRecipeBody = RecipeInputSchema;
	export type GenerateRecipeBody = RecipeInput;

	export const generateRecipeResponse = RecipeOutputSchema;
	// .omit({
	// 	notes: true,
	// });
	export type GenerateRecipeResponse = z.infer<typeof generateRecipeResponse>;
}
