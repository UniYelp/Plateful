import z from "zod";

import type { Recipe, RecipeIngredient } from "@plateful/recipes";
import type { Satisfies } from "@plateful/types";
import {
	MaterialUnitSchema,
	SpiceLevelSchema,
	TemperatureUnitSchema,
} from "./literals";

const IngredientQuantitySchema = z
	.union([
		z
			.object({
				value: z.number(),
				unit: z.nullable(MaterialUnitSchema),
			})
			.meta({
				description:
					"Quantity used in the recipe must not exceed it. Partial usage is allowed if reasonable",
			}),
		z.literal("unlimited").meta({
			description:
				"You may use an unlimited amount of this ingredient. Do NOT abuse it. Use reasonable amounts\nYou must NOT treat any ingredient as unlimited unless explicitly marked.",
		}),
	])
	.meta({
		title: "Ingredient Quantity",
		description: "The quantity that can be used in the recipe",
	});

const IngredientInputSchema = z
	.object({
		name: z.string(),
		// state: z.nullable(z.string()).meta({
		// 	description: "The state of the ingredient.",
		// }),
		quantity: IngredientQuantitySchema,
	})
	.meta({
		title: "Available Ingredient",
	});

export type IngredientInput = Satisfies<
	z.infer<typeof IngredientInputSchema>,
	RecipeIngredient
>;

const ToolsInputSchema = z
	.union([
		z.literal("unlimited").meta({
			description: "Any reasonable tool may be used",
		}),
		z.array(z.string()).meta({
			description:
				'You may ONLY use tools from the list. If "unlimited" is present in the list, prefer the listed tools and only introduce others if clearly necessary',
		}),
	])
	.meta({
		title: "Available tools",
	});

export const RecipeGenInputSchema = z.object({
	ingredients: z.array(IngredientInputSchema),
	tools: ToolsInputSchema,
	tags: z.array(z.string()),
	temperatureUnit: TemperatureUnitSchema,
	toleratedSpiceLevel: SpiceLevelSchema,
});

export type RecipeGenInput = Satisfies<
	z.infer<typeof RecipeGenInputSchema>,
	Pick<Recipe, "ingredients">
>;

export const RecipeGenInputJsonSchema = z.toJSONSchema(RecipeGenInputSchema);
