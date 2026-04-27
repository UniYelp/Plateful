import { createScorer } from "evalite";

import { getExtraTools, getRecipeTools } from "@plateful/recipes";
import type {
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	RecipeGenScore,
} from "../types";

const EXTRA_TOOL_PENALTY = 0.1;

export const RecipeGenToolsUsageScorer = createScorer<
	RecipeGenEvalInput,
	RecipeGenEvalOutput,
	never
>({
	name: "Recipe Gen Tools Usage",
	description: "Checks the tools' usage",
	scorer: ({ input, output }): RecipeGenScore<"ToolsUsage"> => {
		const { tools: inputTools } = input;
		const { recipe } = output;

		const recipeTools = getRecipeTools(recipe);

		const extraTools = getExtraTools(recipe, input);

		if (inputTools === "unlimited") {
			return {
				score: 1,
				metadata: {
					agentNotes: recipe.notes ?? undefined,
				},
			};
		}

		const unusedTools = inputTools.filter(
			(tool) => !recipeTools.includes(tool),
		);

		const hasExtraTools = !!extraTools?.length;

		// TODO: check if the notes include a reason why an tool wasn't used and if the reason is valid
		if (!unusedTools.length && !hasExtraTools) {
			return {
				score: 1,
				metadata: {
					agentNotes: recipe.notes ?? undefined,
				},
			};
		}

		const score =
			1 - (hasExtraTools ? extraTools.length * EXTRA_TOOL_PENALTY : 0);

		return {
			score: Math.max(0, Math.min(1, score)),
			metadata: {
				agentNotes: recipe.notes ?? undefined,
				issues: [
					{
						title: "ToolsUsage",
						description: "Some tools have not been used",
						tools: {
							count: inputTools.length,
							unused: unusedTools.length
								? {
										count: unusedTools.length,
										names: unusedTools,
									}
								: null,
							extra: hasExtraTools
								? {
										count: extraTools.length,
										names: extraTools,
									}
								: null,
						},
					},
				],
			},
		};
	},
});
