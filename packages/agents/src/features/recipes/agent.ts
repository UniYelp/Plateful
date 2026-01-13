import { google } from "@ai-sdk/google";
import { Experimental_Agent as Agent, Output, stepCountIs } from "ai";

import { RecipeGenOutputSchema } from "./schemas";

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
});
