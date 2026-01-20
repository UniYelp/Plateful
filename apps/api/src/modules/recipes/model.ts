import { t } from "elysia";
import z from "zod";

import {
	RecipeGenInputSchema,
	RecipeGenOutputSchema,
} from "@plateful/agents/recipes";
import { RateLimitDetailsSchema } from "../../redis/models/rate-limit.lock";

export namespace RecipesModel {
	export const userLimit = t.Object({
		rpu: RateLimitDetailsSchema,
	});

	export type UserLimit = typeof userLimit.static;

	export const generateRecipeBody = RecipeGenInputSchema.extend({
		userId: z.string(),
	});

	export type GenerateRecipeBody = z.infer<typeof generateRecipeBody>;

	export const generateRecipeResponse = RecipeGenOutputSchema;
    
	export type GenerateRecipeResponse = z.infer<typeof generateRecipeResponse>;
}
