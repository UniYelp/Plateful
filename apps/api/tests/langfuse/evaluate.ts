import { type Evaluator, type ExperimentTask, LangfuseClient } from "@langfuse/client";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";

import * as RecipeService from "../../src/modules/recipes/service";

const sdk = new NodeSDK({
	spanProcessors: [new LangfuseSpanProcessor()],
});

sdk.start();

// Initialize client
const langfuse = new LangfuseClient();

const getNumberOfSteps = (recipe: { steps: Object[]}): number => {
    return recipe.steps.length;
}

const stepsEvaluator: Evaluator<any, any, Record<string, any>> = async ({ input, output, expectedOutput }) => {
            const numSteps = getNumberOfSteps(output);
            return {
                name: "Number of Steps",
                value: numSteps,
                comment: `The recipe has ${numSteps} steps.`,
            };
        }

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
    evaluators: [
        stepsEvaluator
    ]
});

// Print formatted result
console.log(await result.format());

// Important: shut down OpenTelemetry to ensure traces are sent to Langfuse
await sdk.shutdown();
