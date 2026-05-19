import { createScorer } from "evalite";

import {
	UnusedDerivedOutputError,
	validateUnusedDerivedMaterials,
} from "@plateful/recipes";
import { errorMessageByErrorTag } from "../../../src/features/recipes/constants";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

export const RecipeGenNoUnusedDerivedMaterialsScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen No Unused Derived Materials",
	description:
		"Checks if the generated recipe has any unused derived output materials.",
	scorer: ({ output }): RecipeGenScore<UnusedDerivedOutputError> => {
		const { recipeGraph } = output;

		const res = validateUnusedDerivedMaterials(recipeGraph);

		if (!res) {
			return { score: 1 };
		}

		const issues = res.issues;
		const issueTag = UnusedDerivedOutputError._tag;

		return {
			score: Math.max(0, 1 - issues.length * 0.1),
			metadata: {
				issues: [{
					title: issueTag,
					description: errorMessageByErrorTag[issueTag],
					count: issues.length,
					materials: issues.map((issue) => issue.id),
				}],
			},
		};
	},
});
