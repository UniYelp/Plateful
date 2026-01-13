import z from "zod";

import {
	RecipeGenInputSchema,
	RecipeGenOutputSchema,
} from "@plateful/agents/recipes";

export namespace RecipesModel {
	export const generateRecipeBody = RecipeGenInputSchema.extend({
		userId: z.string(),
	});
	export type GenerateRecipeBody = z.infer<typeof generateRecipeBody>;

	export const generateRecipeResponse = RecipeGenOutputSchema;
	// .omit({
	// 	notes: true,
	// });
	export type GenerateRecipeResponse = z.infer<typeof generateRecipeResponse>;
}
