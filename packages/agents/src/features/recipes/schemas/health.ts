import z from "zod";

import type { HealthRecipeStep } from "@plateful/recipes";
import { RecipeMaterialKind, RecipeStepBlockType } from "@plateful/recipes";
import type { Satisfies } from "@plateful/types";
import {
	BaseStepMetadataSchema,
	baseBlockSchemaByKind,
	HealthStepPrioritySchema,
	MaterialBlockSchema,
	RecipeStepBlockMetaDesc,
} from "./output";

const healthSchemaByBlockKind = {
	...baseBlockSchemaByKind,
	[RecipeStepBlockType.Material]: z
		.object({
			...MaterialBlockSchema.shape,
			kind: z.literal(RecipeMaterialKind.Referenced),
		})
		.meta({
			title: "Referenced Material Block",
			description:
				"Health recipe steps can only reference materials, not produce or consume them",
		}),
} as const satisfies {
	[U in RecipeStepBlockType]: z.ZodObject<{
		type: z.ZodLiteral<U>;
	}>;
};

const HealthMaterialBlockSchema = z.union(
	Object.values(healthSchemaByBlockKind),
);

const HealthRecipeStepBlocksSchema = z
	.array(HealthMaterialBlockSchema)
	.nonempty()
	.meta({
		title: "Health Recipe Step Blocks",
		description: RecipeStepBlockMetaDesc,
	});

export const HealthStepMetadataSchema = z
	.object({
		...BaseStepMetadataSchema.shape,
		priority: HealthStepPrioritySchema,
	})
	.meta({
		title: "Health Step Metadata",
	});

export const HealthRecipeStepSchema = z
	.object({
		blocks: HealthRecipeStepBlocksSchema,
		metadata: HealthStepMetadataSchema,
	})
	.meta({
		title: "Health Recipe Step",
	});

export type HealthRecipeStepShape = Satisfies<
	z.infer<typeof HealthRecipeStepSchema>,
	HealthRecipeStep
>;
