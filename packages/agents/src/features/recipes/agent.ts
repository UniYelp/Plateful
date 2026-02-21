import { google } from "@ai-sdk/google";
import { type DeepPartial, Output, stepCountIs, ToolLoopAgent } from "ai";

import { type RecipeGenOutput, RecipeGenOutputSchema } from "./schemas";

export const recipeAgent: ToolLoopAgent<
	never,
	{},
	Output.Output<RecipeGenOutput, DeepPartial<RecipeGenOutput>, never>
> = new ToolLoopAgent({
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
