import { createScorer } from "evalite";

import {
	getMaterialNodeIndicesByKind,
	RecipeMaterialKind,
	UnreachableMaterialError,
	validateNoUnreachableMaterials,
} from "@plateful/recipes";
import { errorMessageByErrorTag } from "../../../src/features/recipes/constants";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

export const RecipeGenNoUnreachableMaterialsScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen No Unreachable Materials",
	description: "Checks if the generated recipe has any unreachable materials.",
	scorer: ({ output }): RecipeGenScore<UnreachableMaterialError> => {
		const { recipeGraph } = output;

		const res = validateNoUnreachableMaterials(recipeGraph);

		if (!res) {
			return { score: 1 };
		}

		const issues = res.issues;
		const issueTag = UnreachableMaterialError._tag;

		const derivedOutputNodes = getMaterialNodeIndicesByKind(
			recipeGraph,
			RecipeMaterialKind.DerivedOutput,
			"outgoing",
		);

		const score = 1 - issues.length / derivedOutputNodes.length;

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
