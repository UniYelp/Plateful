import { t } from "elysia";
import type z from "zod";

import {
	type ExtendedRecipeGenInput,
	RecipeGenInputSchema,
	type RecipeGenResult,
	RecipeGenResultSchema,
} from "@plateful/agents/recipes";
import type { SafetyInput, SafetyOutput } from "@plateful/agents/safety";

export namespace RecipesModel {
	export const generateRecipeQuery = t.Object({
		householdId: t.String(),
	});

	export const generateRecipeBody = RecipeGenInputSchema;

	export type GenerateRecipeBody = z.infer<typeof generateRecipeBody>;

	export type ExtendedGenerateRecipeInput = ExtendedRecipeGenInput;
	export type CheckRecipeSafetyInput = SafetyInput;
	export type CheckRecipeSafetyOutput = SafetyOutput;

	export const generateRecipeCompleteEventData = RecipeGenResultSchema;

	export type GenerateRecipeCompleteEventData = RecipeGenResult;
}
