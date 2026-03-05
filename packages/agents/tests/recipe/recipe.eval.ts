import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { evalite } from "evalite";
import { wrapAISDKModel } from "evalite/ai-sdk";

import { createRecipeGraph } from "@plateful/recipes";
import {
	type RecipeGenInput,
	type RecipeGenOutput,
	RecipeGenOutputSchema,
} from "../../src/features/recipes";
import { generateRecipePrompt } from "../../src/features/recipes/prompt";
import bananaSmoothieInput from "../__fixtures__/Banana-Orange-Smoothie/input.json" with {
	type: "json",
};
import bananaSmoothieNoOutput from "../__fixtures__/Banana-Orange-Smoothie/no-output-material.json" with {
	type: "json",
};
import bananaSmoothieOutput from "../__fixtures__/Banana-Orange-Smoothie/output.json" with {
	type: "json",
};
import {
	RecipeGenIngredientUsedAsOnlyInputScorer,
	RecipeGenNoMaterialProducedBeforeInputsScorer,
	RecipeGenNoMaterialUsedBeforeProducedScorer,
	RecipeGenNoUnreachableMaterialsScorer,
	RecipeGenNoUnusedDerivedMaterialsScorer,
	RecipeGenOutputScorer,
} from "./scorers";
import { RecipeGenIngredientsUsageScorer } from "./scorers/ingredients-usage";
import type { RecipeGenEvalVariant } from "./types";

const isOnlyDummy = process.env.EVAL_DUMMY_ONLY === "true";
const runBadDummy = isOnlyDummy && process.env.EVAL_BAD_DUMMY_OUTPUT === "true";

evalite.each<RecipeGenEvalVariant>([
	{
		name: "Dummy",
		input: {
			isDummy: true,
			res: {
				text: "",
				steps: [],
				recipe: bananaSmoothieOutput as RecipeGenOutput,
			},
		},
		only: isOnlyDummy,
	},
	{
		name: "Dummy - No Output",
		input: {
			isDummy: true,
			res: {
				text: "",
				steps: [],
				recipe: bananaSmoothieNoOutput as RecipeGenOutput,
			},
		},
		only: runBadDummy,
	},
	{
		name: "Gemini-2.5-flash",
		input: { model: google("gemini-2.5-flash") },
	},
])("Recipe Generation/Prompt Embed", {
	data: [{ input: bananaSmoothieInput as RecipeGenInput, only: isOnlyDummy }],
	task: async (input, variant) => {
		if (variant.isDummy) {
			const { res } = variant;

			const recipeGraph = createRecipeGraph({
				ingredients: input.ingredients,
				steps: res.recipe.steps,
			});

			return {
				...res,
				recipeGraph,
			};
		}

		const prompt = generateRecipePrompt(input);

		const res = await generateText({
			model: wrapAISDKModel(variant.model),
			prompt,
			output: Output.object({
				schema: RecipeGenOutputSchema,
			}),
		});

		const { output, text, steps } = res;

		const recipeGraph = createRecipeGraph({
			ingredients: input.ingredients,
			steps: output.steps,
		});

		return {
			text,
			recipe: output,
			steps,
			recipeGraph,
		};
	},
	scorers: [
		RecipeGenOutputScorer,
		RecipeGenIngredientsUsageScorer,
		RecipeGenNoUnreachableMaterialsScorer,
		RecipeGenIngredientUsedAsOnlyInputScorer,
		RecipeGenNoMaterialProducedBeforeInputsScorer,
		RecipeGenNoMaterialUsedBeforeProducedScorer,
		RecipeGenNoUnusedDerivedMaterialsScorer,
	],
	columns: ({ input, output, scores, traces }) => [
		{
			label: "Input",
			value: input,
		},
		{
			label: "Output",
			value: output,
		},
		...scores.map((score) => ({
			label: score.name,
			value: score.metadata,
		})),
		{
			label: "Total Tokens",
			value: traces.reduce((sum, t) => sum + (t.usage?.totalTokens || 0), 0),
		},
	],
});
