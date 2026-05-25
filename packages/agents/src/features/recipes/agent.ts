import { type GoogleLanguageModelOptions, google } from "@ai-sdk/google";
import { type DeepPartial, Output, stepCountIs, ToolLoopAgent } from "ai";

// import { safetySettings } from "./constants";
import { type RecipeGenResult, RecipeGenResultSchema } from "./schemas";

/**
 * @see {@link https://ai.google.dev/gemini/docs/agent-tool-specs|Agent Tool Specs} for details on the available options
 */
export const recipeAgent: ToolLoopAgent<
	never,
	{},
	Output.Output<RecipeGenResult, DeepPartial<RecipeGenResult>, never>
> = new ToolLoopAgent({
	model: google("gemini-3.5-flash"),
	output: Output.object({
		schema: RecipeGenResultSchema,
	}),
	// tools: {
	// 	convertMeasurementUnits,
	// 	convertTemperatures,
	// },
	providerOptions: {
		google: {
			// safetySettings,
		} satisfies GoogleLanguageModelOptions,
	},
	stopWhen: stepCountIs(20),
	experimental_telemetry: { isEnabled: true },
});
