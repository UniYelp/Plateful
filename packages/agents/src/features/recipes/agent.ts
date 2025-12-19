import { google } from "@ai-sdk/google";
import { Experimental_Agent as Agent, Output, stepCountIs } from "ai";

import { RecipeOutputSchema } from "./schemas";

export const recipeAgent = new Agent({
	model: google("gemini-2.5-flash"),
	experimental_output: Output.object({
		schema: RecipeOutputSchema,
	}),
	// tools: {
	// 	convertMeasurementUnits,
	// 	convertTemperatures,
	// },
	stopWhen: stepCountIs(20),
});
