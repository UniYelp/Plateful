import z from "zod";

import { IngredientUnit } from "@plateful/ingredients";
import { TemperatureUnit } from "@plateful/units/temperature";

export const TemperatureUnitSchema = z
	.enum(TemperatureUnit)
	.describe("Temperature Unit");

export const FoodUnitSchema = z.enum(IngredientUnit).describe("Food Unit");

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
	state: z.nullish(z.string()).default(null),
	quantity: IngredientQuantitySchema,
});

export const ToolsInputSchema = z.union([
	z.literal("unlimited"),
	z.array(z.string()),
]);

export const RecipeGenInputSchema = z.object({
	ingredients: z.array(IngredientInputSchema),
	tools: ToolsInputSchema.default("unlimited"),
	tags: z.array(z.string()).default([]),
	temperatureUnit: TemperatureUnitSchema.default(TemperatureUnit.Celsius),
	toleratedSpiceLevel: z
		.enum(["none", "mild", "medium", "hot", "no-preference"])
		.default("no-preference"),
});

export type RecipeGenInput = z.infer<typeof RecipeGenInputSchema>;

export const MaterialBlockSchema = z.object({
	type: z.literal("material"),
	name: z.string(),
	quantity: z.union([
		z.object({
			value: z.number(),
			unit: z.optional(AnyFoodUnitSchema),
		}),
		z.object({
			value: z.literal("remaining"),
			expectedRemainder: z.number(),
			unit: z.optional(AnyFoodUnitSchema),
		}),
	]),
	state: z.optional(z.string()),
	kind: z.enum(["input", "derived-input", "derived-output", "output"]),
});

export const DurationBlockSchema = z.object({
	type: z.literal("time"),
	kind: z.enum(["prep", "cook"]),
	duration: z.iso.duration(),
});

export const TemperatureBlockSchema = z.object({
	type: z.literal("temperature"),
	value: z.number(),
	unit: TemperatureUnitSchema,
});

export const ToolBlockSchema = z.object({
	type: z.literal("tool"),
	name: z.string(),
});

export const StepBlockSchema = z.union([
	z.string(),
	TemperatureBlockSchema,
	DurationBlockSchema,
	ToolBlockSchema,
	MaterialBlockSchema,
]);

export const RecipeGenOutputSchema = z.object({
	title: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
	steps: z.array(z.array(StepBlockSchema)),
	notes: z.nullable(z.string()),
});

export type RecipeGenOutput = z.infer<typeof RecipeGenOutputSchema>;
