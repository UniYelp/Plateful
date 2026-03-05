import { createScorer } from "evalite";

import {
	getMaterialNodeIndicesByKind,
	RecipeHasNoOutputError,
	RecipeMaterialKind,
	UsedOutputMaterialError,
	validateRecipeOutput,
} from "@plateful/recipes";
import { errorMessageByErrorTag } from "../../../src/features/recipes/constants";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

export const RecipeGenOutputScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen Output",
	description: "Checks if the generated recipe's output is valid.",
	scorer: ({
		output,
	}): RecipeGenScore<RecipeHasNoOutputError | UsedOutputMaterialError> => {
		const { recipeGraph } = output;

		const res = validateRecipeOutput(recipeGraph);

		if (!res) {
			return {
				score: 1,
			};
		}

		const issues = res.issues;

		const hasNoOutput = issues.some(
			(issue) => issue instanceof RecipeHasNoOutputError,
		);

		if (hasNoOutput) {
			const issueTag = RecipeHasNoOutputError._tag;

			return {
				score: 0,
				metadata: {
					issues: [
						{
							title: issueTag,
							description: errorMessageByErrorTag[issueTag],
						},
					],
				},
			};
		}

		const outputNodes = getMaterialNodeIndicesByKind(
			recipeGraph,
			RecipeMaterialKind.Output,
			"outgoing",
		);

		const usedOutputsIssues = issues.filter(
			(issue) => issue instanceof UsedOutputMaterialError,
		);

		if (!usedOutputsIssues.length) return { score: 1 };

		const usedOutputsScore = 1 - usedOutputsIssues.length / outputNodes.length;

		const issueTag = UsedOutputMaterialError._tag;

		return {
			score: usedOutputsScore,
			metadata: {
				issues: [
					{
						title: issueTag,
						description: errorMessageByErrorTag[issueTag],
						count: usedOutputsIssues.length,
						outputs: outputNodes.length,
						materials: usedOutputsIssues.map((issue) => issue.id),
					},
				],
			},
		};
	},
});
