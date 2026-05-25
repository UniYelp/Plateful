import { createScorer } from "evalite";

import {
	UnusedInputMaterialInStepError,
	validateNoUnusedInputMaterialsInStep,
} from "@plateful/recipes";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

export const RecipeGenIngredientsUsageScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen Ingredients Usage",
	description: "Checks the ingredients' usage",
	scorer: ({ output }): RecipeGenScore<UnusedInputMaterialInStepError> => {
		const { recipe } = output;

		const unusedInputMaterialsIssues =
			validateNoUnusedInputMaterialsInStep(recipe);

		if (!unusedInputMaterialsIssues?.issues.length) {
			return {
				score: 1,
			};
		}

		const unusedIngredientsPenalty = Math.min(
			new Set(unusedInputMaterialsIssues.issues.map((issue) => issue.stepIndex))
				.size / recipe.steps.length,
			1,
		);

		const score = 1 - unusedIngredientsPenalty;

		return {
			score: Math.max(0, Math.min(1, score)),
			metadata: {
				agentNotes: recipe.notes ?? undefined,
				issues: [
					{
						title: UnusedInputMaterialInStepError._tag,
						description:
							"Some input materials have not been used in the recipe steps.",
						materials: {
							unused: {
								occurrences: unusedInputMaterialsIssues.issues.length,
								in: Object.entries(
									Object.groupBy(
										unusedInputMaterialsIssues.issues,
										({ stepIndex }) => stepIndex,
									),
								).flatMap(([step, issues]) => {
									if (!issues?.length) {
										return [];
									}

									return {
										step,
										names: Array.from(new Set(issues.map(({ id }) => id))),
									};
								}),
							},
						},
					},
				],
			},
		};
	},
});
