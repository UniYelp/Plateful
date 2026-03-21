import { createScorer } from "evalite";

import {
	InternalRecipeGraphError,
	MaterialQuantityExceededError,
	validateNoMaterialQuantityExceeded,
} from "@plateful/recipes";
import { errorMessageByErrorTag } from "../../../src/features/recipes/constants";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

export const RecipeGenNoExceedingIngredientsScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen No Exceeding Ingredients",
	description:
		"Checks if the generated recipe used more ingredients than provided or produced.",
	scorer: ({
		output,
	}): RecipeGenScore<
		MaterialQuantityExceededError | InternalRecipeGraphError
	> => {
		const { recipeGraph } = output;

		const res = validateNoMaterialQuantityExceeded(recipeGraph);

		if (!res) {
			return { score: 1 };
		}

		const internalIssues = res.issues.filter(
			(issue) => issue instanceof InternalRecipeGraphError,
		);

		if (internalIssues.length) {
			return {
				score: 0,
				metadata: {
					issues: [
						{
							title: InternalRecipeGraphError._tag,
							description:
								errorMessageByErrorTag[InternalRecipeGraphError._tag],
							count: internalIssues.length,
							reason: internalIssues.map((issue) => issue.message).join(", "),
						},
					],
				},
			};
		}

		const issues = res.issues as MaterialQuantityExceededError[];
		const issueTag = MaterialQuantityExceededError._tag;

		// Assuming inputs = flattenedIngredients, but we can just use the absolute count of violations
		// Or we can say 1 - (issues.length / totalIngredients) but we might just use issues.length to decrease score
		// In previous test `no-unreachable-materials` it uses length of derivedOutputNodes as denominator
		// Here, maybe denominator is something else, or just a static penalty

		// For simplicity, let's penalize linearly with a max penalty of 1.
		// Usually each violation could take off 0.1 or we could find total inputs.
		// Given we don't have total number of material nodes easily accessible here without a new util,
		// let's just subtract 0.2 per issue, bounding at 0.
		const PENALTY_PER_ISSUE = 0.2;
		const score = Math.max(0, 1 - issues.length * PENALTY_PER_ISSUE);

		return {
			score,
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
