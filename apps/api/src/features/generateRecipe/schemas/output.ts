import z from "zod";

import { RecipeMaterialKind } from "@plateful/recipes";
import type { UnionToTuple, ValueOf } from "@plateful/types";
import { MaterialUnitSchema, TemperatureUnitSchema } from "./literals";

type MaterialBlockKindSchemaOption = z.ZodUnion<
	Readonly<
		UnionToTuple<
			ValueOf<{
				[U in RecipeMaterialKind]: z.ZodLiteral<U>;
			}>
		>
	>
>;

const OutputMaterialBlockKindSchema = z.union([
	z.literal(RecipeMaterialKind.DerivedOutput).meta({
		description:
			"A material that is produced in the step and may be used in later steps.",
	}),
	z.literal(RecipeMaterialKind.Output).meta({
		description:
			"A final yield material that is not used to produce any other material.",
	}),
]);

export const MaterialBlockKindSchema = z
	.union([
		z.literal(RecipeMaterialKind.Input).meta({
			description:
				"A material provided directly from the user's available ingredients list.",
		}),
		z.literal(RecipeMaterialKind.DerivedInput).meta({
			description:
				"A material that was produced in an earlier step and is now being consumed.",
		}),
		z.literal(RecipeMaterialKind.DerivedOutput).meta({
			description:
				"A material that is produced in the step and may be used in later steps.",
		}),
		z.literal(RecipeMaterialKind.Output).meta({
			description:
				"A final yield material that is not used to produce any other material.",
		}),
	])
	.meta({
		title: "Recipe Material Kind",
	}) satisfies MaterialBlockKindSchemaOption;

export const MaterialBlockSchema = z.object({
	type: z.literal("material"),
	name: z.string(),
	quantity: z.object({
		value: z.number(),
		unit: z.optional(MaterialUnitSchema),
	}),
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
