import z from "zod";

import { ingredientUnits } from "@plateful/ingredients";
import { TemperatureUnit, temperatureUnits } from "@plateful/units/temperature";

export const TemperatureUnitSchema = z
	.enum(temperatureUnits)
	.describe("Temperature Unit");

export const FoodUnitSchema = z.enum(ingredientUnits).describe("Food Unit");

export const AnyFoodUnitSchema = z.union([
	FoodUnitSchema,
	z.object({
		type: z.literal("other"),
		value: z.string(),
	}),
]);

export const IngredientQuantitySchema = z.union([
	z.object({
		value: z.number(),
		unit: z.nullish(z.string()).default(null),
	}),
	z.literal("unlimited"),
]);

export const IngredientInputSchema = z.object({
	name: z.string(),
	quantity: IngredientQuantitySchema,
});

export const ToolsInputSchema = z.union([
	z.literal("unlimited"),
	z.array(z.string()),
]);

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

export const IngredientBlockSchema = z.object({
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

export const DurationBlockSchema = z.object({
	type: z.literal("duration"),
	kind: z.enum(["prep", "cook"]),
	duration: z.iso.duration(),
});

export const TemperatureBlockSchema = z.object({
	type: z.literal("temperature"),
	value: z.number(),
	unit: TemperatureUnitSchema,
});

export const StepBlockSchema = z.union([
	z.string(),
	TemperatureBlockSchema,
	DurationBlockSchema,
	IngredientBlockSchema,
]);

export const RecipeOutputSchema = z.object({
	title: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
	steps: z.array(z.array(StepBlockSchema)),
	notes: z.nullable(z.string()),
});

export type RecipeOutput = z.infer<typeof RecipeOutputSchema>;
