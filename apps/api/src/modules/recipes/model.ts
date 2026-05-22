import { t } from "elysia";
import type z from "zod";

import {
	RecipeGenInputSchema,
	RecipeGenResultSchema,
} from "@plateful/agents/recipes";

export namespace RecipesModel {
	export const generateRecipeQuery = t.Object({
		householdId: t.String(),
	});

	export const generateRecipeBody = RecipeGenInputSchema;

	export type GenerateRecipeBody = z.infer<typeof generateRecipeBody>;

	export const generateRecipeCompleteEventData = RecipeGenResultSchema;

	export type GenerateRecipeCompleteEventData = z.infer<
		typeof generateRecipeCompleteEventData
	>;
}
