import { createScorer } from "evalite";

import {
	MaterialUsedBeforeProducedError,
	validateNoMaterialUsedBeforeProduced,
} from "@plateful/recipes";
import { errorMessageByErrorTag } from "../../../src/features/recipes/constants";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

export const RecipeGenNoMaterialUsedBeforeProducedScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen No Material Used Before Produced",
	description:
		"Checks if the generated recipe uses any materials before they are produced.",
	scorer: ({ output }): RecipeGenScore<MaterialUsedBeforeProducedError> => {
		const { recipeGraph } = output;

		const res = validateNoMaterialUsedBeforeProduced(recipeGraph);

		if (!res) {
			return { score: 1 };
		}

		const issues = res.issues;
		const issueTag = MaterialUsedBeforeProducedError._tag;

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
