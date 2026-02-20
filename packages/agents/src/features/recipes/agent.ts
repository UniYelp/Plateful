import { google } from "@ai-sdk/google";
import { ToolLoopAgent, Output, stepCountIs } from "ai";

import { RecipeGenOutputSchema } from "./schemas";

export const recipeAgent = new ToolLoopAgent({
	model: google("gemini-2.5-flash"),
	output: Output.object({
		schema: RecipeGenOutputSchema,
	}),
	// tools: {
	// 	convertMeasurementUnits,
	// 	convertTemperatures,
	// },
	stopWhen: stepCountIs(20),
	experimental_telemetry: { isEnabled: true },
});
