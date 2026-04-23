import { createScorer } from "evalite";

import { getExtraIngredients, getUnusedIngredients } from "@plateful/recipes";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

const NO_NOTES_SCORE_PENALTY = 0.25;
const NOTES_SCORE_DE_PENALTY = 0.15;
const EXTRA_INGREDIENTS_PENALTY = 0.6;

export const RecipeGenIngredientsUsageScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen Ingredients Usage",
	description: "Checks the ingredients' usage",
	scorer: ({ input, output }): RecipeGenScore<"IngredientsUsage"> => {
		const { ingredients: inputIngredients } = input;
		const { recipe, recipeGraph } = output;

		const extraIngredients = getExtraIngredients(recipe, input);
		const unusedIngredients = getUnusedIngredients(recipeGraph);

		// TODO: check if the notes include a reason why an ingredient wasn't used and if the reason is valid
		if (!unusedIngredients.length && !extraIngredients.length) {
			return {
				score: 1,
				metadata: {
					agentNotes: recipe.notes ?? undefined,
				},
			};
		}

		const inputIngredientsSet = new Set(
			inputIngredients.map((ing) => ing.name),
		);

		const unusedIngredientsPenalty =
			unusedIngredients.length / inputIngredientsSet.size;

		const score =
			1 -
			unusedIngredientsPenalty -
			(extraIngredients.length ? EXTRA_INGREDIENTS_PENALTY : 0) -
			(recipe.notes ? -NOTES_SCORE_DE_PENALTY : NO_NOTES_SCORE_PENALTY);

		return {
			score: Math.max(0, Math.min(1, score)),
			metadata: {
				agentNotes: recipe.notes ?? undefined,
				issues: [
					{
						title: "IngredientsUsage",
						description: "Some ingredients have not been used",
						ingredients: {
							count: inputIngredientsSet.size,
							unused: unusedIngredients.length
								? {
										count: unusedIngredients.length,
										names: unusedIngredients.map((ing) => ing.name),
									}
								: null,
							extra: extraIngredients.length
								? {
										count: extraIngredients.length,
										names: extraIngredients,
									}
								: null,
						},
					},
				],
			},
		};
	},
});
