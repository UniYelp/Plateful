import z from "zod";

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
	safetyCritique: z.string().optional().meta({
		description:
			"Safety critique feedback from the previous recipe generation attempt",
	}),
	previouslyGenerated: z.string().optional().meta({
		description:
			"The previously generated recipe that the safety critique applies to",
	}),
});

export type RecipeGenInput = z.infer<typeof RecipeGenInputSchema>;

export const RecipeGenInputJsonSchema = z.toJSONSchema(RecipeGenInputSchema);
