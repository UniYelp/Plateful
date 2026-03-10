import { createScorer } from "evalite";

import { getUnusedIngredients } from "@plateful/recipes";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

const NO_NOTES_SCORE_PENALTY = 0.25;
const NOTES_SCORE_DE_PENALTY = 0.15;

export const RecipeGenIngredientsUsageScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen Ingredients Usage",
	description: "Checks the ingredients' usage",
	scorer: ({ input, output }): RecipeGenScore<"UnusedIngredients"> => {
		const { ingredients: flattenedIngredients } = input;
		const { recipe, recipeGraph } = output;

		const unusedIngredients = getUnusedIngredients(recipeGraph);

		// TODO: check if the notes include a reason why an ingredient wasn't used
		if (!unusedIngredients.length) {
			return {
				score: 1,
			};
		}

		const ingredients = new Set(flattenedIngredients.map((ing) => ing.name));

		const unusedIngredientsPenalty =
			unusedIngredients.length / ingredients.size;

		const score =
			1 -
			unusedIngredientsPenalty -
			(recipe.notes ? -NOTES_SCORE_DE_PENALTY : NO_NOTES_SCORE_PENALTY);

		return {
			score: Math.max(0, Math.min(1, score)),
			metadata: {
				issues: [
					{
						title: "UnusedIngredients",
						description: "Some ingredients have not been used",
						ingredients: {
							count: ingredients.size,
							unused: {
								count: unusedIngredients.length,
								names: unusedIngredients.map((ing) => ing.name),
							},
						},
						agentNotes: recipe.notes,
					},
				],
			},
		};
	},
});

