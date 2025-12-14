import { google } from "@ai-sdk/google";
import { Experimental_Agent as Agent, Output, stepCountIs } from "ai";
import dedent from "dedent";
import z from "zod";

import { foodUnits } from "@plateful/ingredients";
import { TemperatureUnit, temperatureUnits } from "@plateful/units/temperature";

const TemperatureUnitSchema = z
	.enum(temperatureUnits)
	.describe("Temperature Unit");

const FoodUnitSchema = z.enum(foodUnits).describe("Food Unit");

const AnyFoodUnitSchema = z.union([
	FoodUnitSchema,
	z.object({
		type: z.literal("other"),
		value: z.string(),
	}),
]);

const IngredientQuantitySchema = z.union([
	z.object({
		value: z.number(),
		unit: z.nullish(z.string()).default(null),
	}),
	z.literal("unlimited"),
]);

const IngredientInputSchema = z.object({
	name: z.string(),
	quantity: IngredientQuantitySchema,
});

const ToolsInputSchema = z.union([z.literal("unlimited"), z.array(z.string())]);

export const RecipeInputSchema = z.object({
	ingredients: z.array(IngredientInputSchema),
	tools: ToolsInputSchema.default("unlimited"),
	tags: z.array(z.string()).default([]),
	temperatureUnit: TemperatureUnitSchema.default(TemperatureUnit.Celsius),
	toleratedSpiceLevel: z
		.enum(["none", "mild", "medium", "hot"])
		.default("none"),
});

export type RecipeInput = z.infer<typeof RecipeInputSchema>;

const IngredientBlockSchema = z.object({
	type: z.literal("ingredient"),
	name: z.string(),
	quantity: z.union([
		z.object({
			value: z.number(),
			unit: z.nullable(AnyFoodUnitSchema),
		}),
		z.object({
			value: z.literal("remaining"),
			expectedRemainder: z.number(),
			unit: z.nullable(AnyFoodUnitSchema),
		}),
	]),
});

const DurationBlockSchema = z.object({
	type: z.literal("duration"),
	kind: z.enum(["prep", "cook"]),
	duration: z.iso.duration(),
});

const TemperatureBlockSchema = z.object({
	type: z.literal("temperature"),
	value: z.number(),
	unit: TemperatureUnitSchema,
});

const StepBlockSchema = z.union([
	z.string(),
	TemperatureBlockSchema,
	DurationBlockSchema,
	IngredientBlockSchema,
]);

const RecipeOutputSchema = z.object({
	title: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
	steps: z.array(z.array(StepBlockSchema)),
	notes: z.nullable(z.string()),
});

export type RecipeOutput = z.infer<typeof RecipeOutputSchema>;

// const { convertUnits: convertTemperatureUnits } = temperatureUnitConversion();

export const systemPrompt = dedent`
    You are a Recipe Composer AI.

    Your task is to generate a realistic, cookable recipe using only the explicitly provided ingredients, quantities, tools, and constraints. You must strictly respect all inputs and must not assume the availability of anything not explicitly provided.

    INPUTS YOU WILL RECEIVE:
    - A list of ingredients, each with:
    - name (string)
    - quantity:
        - a specified amount (value + optional unit), OR
        - marked as "unlimited"
    - Optional constraints and tags:
    - dietary tags (e.g., vegan, kosher)
    - allergies (must be strictly avoided)
    - preferred temperature unit (Celsius or Fahrenheit)
    - tolerated spice level
    - Available tools:
    - "unlimited", OR
    - an array of tool names, optionally including "unlimited"

    INGREDIENT USAGE RULES:
    1. You may ONLY use ingredients provided in the input.
    2. Ingredients with specified quantities must not be exceeded.
    3. Partial usage is allowed if reasonable.
    4. Ingredients marked as "unlimited" may be used in reasonable amounts.
    5. You must NOT treat any ingredient as unlimited unless explicitly marked.
    6. If an ingredient is not used at all, you must explain why in the notes.
    7. A special meta-quantity "remaining" may be used ONLY:
    - as the final usage of an ingredient,
    - after at least one quantified usage of that ingredient,
    - and must include an expected remainder amount for validation.
    8. "remaining" must be used sparingly and intentionally.

    TOOLS RULES:
    9. If available tools are "unlimited", any reasonable tool may be used.
    10. If tools are provided as a list:
        - you may ONLY use tools from the list,
        - if "unlimited" is present in the list, prefer the listed tools and only introduce others if clearly necessary.

    OUTPUT FORMAT (STRICT):

    Return a single object with the following top-level fields ONLY:

    - title (string)
    - description (string)
    - tags (array of strings)
    - steps (array)
    - notes (string or null)

    STEP FORMAT:

    Each step MUST be an array containing one or more of the following block types, in order:

    1. Plain text (string)
    2. Ingredient block (object)
    3. Time block (object)
    4. Temperature block (object)

    INGREDIENT BLOCK SHAPE:
    {
    ingredient: string,
    quantity:
        | { value: number, unit?: string }
        | { value: "remaining", expectedRemainder: number, unit?: string }
    }

    TIME BLOCK SHAPE:
    {
    duration: string,          // ISO 8601 duration (e.g., "PT5M")
    kind: "prep" | "cook"
    }

    TEMPERATURE BLOCK RULES:
    - Temperature blocks must appear in the step where the temperature is first introduced.
    - Temperature blocks must be placed immediately after the plain text that introduces the heating context.
    - Temperature blocks must use the preferred temperature unit.
    - Do NOT encode tools or actions inside temperature blocks; express context in plain text only.

    RULES FOR STEPS:
    11. Ingredient blocks must appear at the point in the step where the ingredient is used.
    12. Time blocks must appear in the step they apply to.
    13. Do NOT include tools, temperatures, or actions as structured objects-express them in plain text only.
    14. Do NOT introduce any additional structured block types.
    15. Steps must be readable as-is by a human when rendered sequentially.

    GENERAL CONSTRAINTS:
    16. Respect all dietary tags and allergies with zero exceptions.
    17. Use the requested temperature unit consistently in plain text.
    18. Prefer simple, practical cooking methods.
    19. Avoid unnecessary verbosity.

    Your goal is to produce a clear, consistent recipe that can be rendered as human-readable instructions while allowing reliable extraction of ingredient usage and time information.
`;

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
