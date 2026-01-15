import { google } from "@ai-sdk/google";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { Experimental_Agent as Agent, Output, stepCountIs } from "ai";

import { RecipeGenOutputSchema } from "./schemas";

const sdk = new NodeSDK({
	spanProcessors: [new LangfuseSpanProcessor()],
});

sdk.start();

export const recipeAgent = new Agent({
	model: google("gemini-2.5-flash"),
	experimental_output: Output.object({
		schema: RecipeGenOutputSchema,
	}),
	// tools: {
	// 	convertMeasurementUnits,
	// 	convertTemperatures,
	// },
	stopWhen: stepCountIs(20),
	experimental_telemetry: { isEnabled: true },
});
