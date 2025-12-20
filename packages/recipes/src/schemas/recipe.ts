import z from "zod";

import { TemperatureUnit } from "@plateful/units/temperature";
import { ALL_MATERIAL, REMAINING_MATERIAL } from "../constants";
import { RecipeTimeKind } from "../enums";
import { RecipeMaterialKind } from "../enums/recipe-material-kind";
import { RecipeStepBlockType } from "../enums/recipe-step-block-type";

export const TemperatureUnitSchema = z
	.enum(TemperatureUnit)
	.meta({ description: "Temperature Unit" });

export const ToolBlockSchema = z.object({
	type: z.literal(RecipeStepBlockType.Tool),
	name: z.string(),
	required: z.optional(z.boolean()),
});

export const TimeBlockSchema = z.object({
	type: z.literal(RecipeStepBlockType.Time),
	duration: z.iso.duration(),
	kind: z.enum(RecipeTimeKind),
});

export const TemperatureBlockSchema = z.object({
	type: z.literal(RecipeStepBlockType.Temperature),
	value: z.number(),
	unit: TemperatureUnitSchema,
});

export const MaterialBlockSchema = z.object({
	type: z.literal(RecipeStepBlockType.Material),
	name: z.string(),
	quantity: z.union([
		z.object({
			value: z.number(),
			unit: z.optional(z.string()),
		}),
		z.literal(REMAINING_MATERIAL),
		z.literal(ALL_MATERIAL),
	]),
	state: z.optional(z.string()),
	kind: z.enum(RecipeMaterialKind),
});

// export const PlainTextBlockSchema = z.object({
// 	type: z.literal(RecipeStepBlockType.PlainText),
// 	value: z.string(),
// });

export const BlockSchemaShapeByType = {
	// [RecipeStepBlockType.PlainText]: PlainTextBlockSchema, // TODO: check if necessary
	[RecipeStepBlockType.Tool]: ToolBlockSchema,
	[RecipeStepBlockType.Time]: TimeBlockSchema,
	[RecipeStepBlockType.Temperature]: TemperatureBlockSchema,
	[RecipeStepBlockType.Material]: MaterialBlockSchema,
} as const satisfies {
	[T in RecipeStepBlockType]: z.ZodObject<{ type: z.ZodLiteral<T> }>;
};

export const StepBlockSchema = z.union([
	z.string(),
	...Object.values(BlockSchemaShapeByType),
]);

export const RecipeDtoSchema = z.object({
	title: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
	steps: z.array(z.array(StepBlockSchema)),
	notes: z.nullable(z.string()),
});

export type RecipeDto = z.infer<typeof RecipeDtoSchema>;
