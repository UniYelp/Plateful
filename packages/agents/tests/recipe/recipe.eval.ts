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
	RecipeGenIngredientsUsageScorer,
	RecipeGenIngredientUsedAsOnlyInputScorer,
	RecipeGenNoMaterialProducedBeforeInputsScorer,
	RecipeGenNoMaterialUsedBeforeProducedScorer,
	RecipeGenNoUnreachableMaterialsScorer,
	RecipeGenNoUnusedDerivedMaterialsScorer,
	RecipeGenOutputScorer,
	RecipeGenToolsUsageScorer,
} from "./scorers";
import type { EvalVariant, RecipeGenEvalVariant } from "./types";

const isDummyOnly = process.env.EVAL_RUN_DUMMY_ONLY === "true";
const runDummy = process.env.EVAL_RUN_DUMMY === "true";
const runBadDummy = process.env.EVAL_RUN_BAD_DUMMY === "true";
const runLiveModel = process.env.EVAL_RUN_LIVE_MODEL === "true";

const badDummyVariant: EvalVariant[] = [
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
		only: isDummyOnly,
	},
];

const dummyVariants: EvalVariant[] = [
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
		only: isDummyOnly,
	},
];

const liveVariants: EvalVariant[] = [
	{
		name: "Gemini-2.5-flash",
		input: { model: google("gemini-2.5-flash") },
	},
];

evalite.each<RecipeGenEvalVariant>([
	...(runDummy ? dummyVariants : []),
	...(runBadDummy ? badDummyVariant : []),
	...(runLiveModel ? liveVariants : []),
])("Recipe Generation/Prompt Embed", {
	data: [{ input: bananaSmoothieInput as RecipeGenInput, only: isDummyOnly }],
	task: async (input, variant) => {
		if (variant.isDummy) {
			const { res } = variant;

			const recipeGraph = createRecipeGraph(
				{
					steps: res.recipe.steps,
				},
				input,
			);

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

		const recipeGraph = createRecipeGraph(
			{
				steps: output.steps,
			},
			input,
		);

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
		RecipeGenToolsUsageScorer,
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
