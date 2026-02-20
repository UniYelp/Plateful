import {
	type Evaluator,
	type ExperimentTask,
	LangfuseClient,
} from "@langfuse/client";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";

import type { RecipeGenInput, RecipeGenOutput } from "@plateful/agents/recipes";
import * as RecipeService from "../../src/modules/recipes/service";

const sdk = new NodeSDK({
	spanProcessors: [new LangfuseSpanProcessor()],
});

sdk.start();

// Initialize client
const langfuse = new LangfuseClient();

const getNumberOfSteps = (recipe: { steps: object[] }): number => {
	return recipe.steps.length;
};

const stepsEvaluator: Evaluator<
	RecipeGenInput,
	RecipeGenOutput,
	Record<string, any>
> = async ({ input, output, expectedOutput }) => {
	if (!output || typeof output !== "object" || !Array.isArray(output.steps)) {
		return {
			name: "Number of Steps",
			value: -1,
			comment: "Output is not in the expected format.",
		};
	}

	const numSteps = getNumberOfSteps(output);
	return {
		name: "Number of Steps",
		value: numSteps,
		comment: `The recipe has ${numSteps} steps.`,
	};
};

const test: ExperimentTask = async ({ input }) => {
	const result = await RecipeService.generateRecipe(input);

	return result;
};

// Get dataset from Langfuse
const dataset = await langfuse.dataset.get("Recipes/tiny");

// Run experiment directly on the dataset
const result = await dataset.runExperiment({
	name: "First eval",
	description: "testing the recipe agent with a small dataset",
	task: test,
	evaluators: [stepsEvaluator],
});

// Print formatted result
console.log(await result.format());

// Important: shut down OpenTelemetry to ensure traces are sent to Langfuse
await sdk.shutdown();
