import { createScorer } from "evalite";

import {
	MaterialProducedBeforeInputsError,
	validateNoMaterialProducedBeforeInputs,
} from "@plateful/recipes";
import { errorMessageByErrorTag } from "../../../src/features/recipes/constants";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

export const RecipeGenNoMaterialProducedBeforeInputsScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen No Material Produced Before Inputs",
	description:
		"Checks if the generated recipe produces any materials before their inputs are utilized.",
	scorer: ({ output }): RecipeGenScore<MaterialProducedBeforeInputsError> => {
		const { recipeGraph } = output;

		const res = validateNoMaterialProducedBeforeInputs(recipeGraph);

		if (!res) {
			return { score: 1 };
		}

		const issues = res.issues;
		const issueTag = MaterialProducedBeforeInputsError._tag;

		return {
			score: Math.max(0, 1 - issues.length * 0.1), // Penalize per issue
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
