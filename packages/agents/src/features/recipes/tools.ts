import { tool } from "ai";
import z from "zod";

import { convertIngredientUnits } from "@plateful/ingredients";
import { temperatureUnitConversion } from "@plateful/units/temperature";
import { MaterialUnitSchema, TemperatureUnitSchema } from "./schemas";

const { convertUnits: convertTemperatureUnits } = temperatureUnitConversion();

export const convertMeasurementUnits = tool({
	description: "Convert food measurement units if possible",
	inputSchema: z.object({
		value: z.number(),
		from: MaterialUnitSchema,
		to: MaterialUnitSchema,
	}),
	outputSchema: z.object({
		result: z.union([
			z.number().describe("The updated value in the new measurement unit"),
			z
				.null()
				.describe(
					"The current measurement unit cannot be converted to the new one",
				),
		]),
	}),
	execute: ({ value, from, to }) => {
		const result = convertIngredientUnits(from, to, value);
		return { result: result ? result.value : result };
	},
});

export const convertTemperatures = tool({
	description: "Convert between temperatures",
	inputSchema: z.object({
		value: z.number(),
		from: TemperatureUnitSchema,
		to: TemperatureUnitSchema,
	}),
	outputSchema: z.object({
		result: z.number(),
	}),
	execute: ({ value, from, to }) => {
		const result = convertTemperatureUnits(from, to, value)!;
		return { result };
	},
});
