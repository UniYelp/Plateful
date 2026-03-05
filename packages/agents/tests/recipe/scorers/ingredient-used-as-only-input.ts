import { createScorer } from "evalite";

import {
	IngredientNotUsedOnlyAsInputError,
	validateIngredientsUsedOnlyAsInputs,
} from "@plateful/recipes";
import { errorMessageByErrorTag } from "../../../src/features/recipes/constants";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

export const RecipeGenIngredientUsedAsOnlyInputScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen Ingredient Used Only As Input",
	description:
		"Checks if the generated recipe has ingredients used only as inputs.",
	scorer: ({ output }): RecipeGenScore<IngredientNotUsedOnlyAsInputError> => {
		const { recipeGraph } = output;

		const res = validateIngredientsUsedOnlyAsInputs(recipeGraph);

		if (!res) {
			return { score: 1 };
		}

		const issues = res.issues;
		const issueTag = IngredientNotUsedOnlyAsInputError._tag;

		return {
			score: Math.max(0, 1 - issues.length * 0.1),
			metadata: {
				issues: [
					{
						title: issueTag,
						description: errorMessageByErrorTag[issueTag],
						count: issues.length,
						materials: issues.map((issue) => issue.id),
					},
				],
			},
		};
	},
});
