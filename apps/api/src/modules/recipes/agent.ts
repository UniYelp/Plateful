import { google } from "@ai-sdk/google";
import { Experimental_Agent as Agent, Output, stepCountIs } from "ai";

import { systemPrompt } from "./prompt";
import { type RecipeInput, RecipeOutputSchema } from "./schemas";

export const recipeAgent = new Agent({
	model: google("gemini-2.5-flash"),
	system: systemPrompt,
	experimental_output: Output.object({
		schema: RecipeOutputSchema,
	}),
	// tools: {
	// 	convertMeasurementUnits: tool({
	// 		description: "Convert food measurement units if possible",
	// 		inputSchema: z.object({
	// 			value: z.number(),
	// 			from: AnyFoodUnitSchema,
	// 			to: AnyFoodUnitSchema,
	// 		}),
	// 		outputSchema: z.object({
	// 			result: z.union([
	// 				z.number().describe("The updated value in the new measurement unit"),
	// 				z
	// 					.null()
	// 					.describe(
	// 						"The current measurement unit cannot be converted to the new one",
	// 					),
	// 			]),
	// 		}),
	// 		execute: ({ value, from, to }) => {
	// 			const fromUnit = typeof from === "string" ? from : from.value;
	// 			const toUnit = typeof to === "string" ? to : to.value;

	// 			const result = convertFoodUnits(fromUnit, toUnit, value);

	// 			return { result: result ? result.value : result };
	// 		},
	// 	}),
	// 	convertTemperatures: tool({
	// 		description: "Convert between temperatures",
	// 		inputSchema: z.object({
	// 			value: z.number(),
	// 			from: TemperatureUnitSchema,
	// 			to: TemperatureUnitSchema,
	// 		}),
	// 		outputSchema: z.object({
	// 			result: z.number(),
	// 		}),
	// 		execute: ({ value, from, to }) => {
	// 			const result = convertTemperatureUnits(from, to, value)!;
	// 			return { result };
	// 		},
	// 	}),
	// },
	stopWhen: stepCountIs(20),
});
