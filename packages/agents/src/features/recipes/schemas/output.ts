import dedent from "dedent";
import z from "zod";

import {
	type Recipe,
	type RecipeMaterialBlock,
	RecipeMaterialKind,
	RecipeStepBlockType,
} from "@plateful/recipes";
import type { Satisfies, StrictOmit } from "@plateful/types";
import { MaterialUnitSchema, TemperatureUnitSchema } from "./literals";

const InputMaterialKindSchema = z.literal(RecipeMaterialKind.Input).meta({
	title: "Input Material Kind",
	description:
		"A material provided directly from the user's available ingredients list.",
});

const DerivedInputMaterialKindSchema = z
	.literal(RecipeMaterialKind.DerivedInput)
	.meta({
		title: "Derived-Input Material Kind",
		description:
			"A material that was produced in an earlier step and is now being consumed.",
	});

const DerivedOutputMaterialKindSchema = z
	.literal(RecipeMaterialKind.DerivedOutput)
	.meta({
		title: "Derived-Output Material Kind",
		description:
			"A material that is produced in the step and may be used in later steps.",
	});

const OutputMaterialKindSchema = z.literal(RecipeMaterialKind.Output).meta({
	title: "Output Material Kind",
	description:
		"A final yield material that is not used to produce any other material.",
});

const schemaByMaterialKind = {
	[InputMaterialKindSchema.value]: InputMaterialKindSchema,
	[DerivedInputMaterialKindSchema.value]: DerivedInputMaterialKindSchema,
	[OutputMaterialKindSchema.value]: OutputMaterialKindSchema,
	[DerivedOutputMaterialKindSchema.value]: DerivedOutputMaterialKindSchema,
	// TODO: add reference blocks for referencing a material during a step without using it actively
} as const satisfies {
	[U in RecipeMaterialKind]: z.ZodLiteral<U>;
};

export const RecipeMaterialKindSchema = z
	.union(Object.values(schemaByMaterialKind))
	.meta({
		title: "Recipe Material Kind",
	});

export const MaterialBlockSchema = z
	.object({
		type: z.literal(RecipeStepBlockType.Material),
		name: z.string(),
		quantity: z.object({
			value: z.number(),
			unit: z.nullable(MaterialUnitSchema).optional().meta({
				description:
					"The unit of the material. Must be null if the ingredient inherently lacks one (e.g. '5 tomatoes' -> unit: null, value: 5). Do not hallucinate a unit here.",
			}),
		}),
		// state: z.optional(z.string()).meta({
		// 	description: "The state of the material.",
		// }),
		// - When referencing materials, use the base material name whenever possible. Do NOT include the state in the material's name unless the state is a commonly recognized part of the material name (e.g., “whipped cream”), in that case, do not use the state field. Track any changes in state using the state field of the material block. Mention the state in the name only if it is necessary for clarity.

		kind: RecipeMaterialKindSchema,
	})
	.meta({
		title: "Material Block",
		description: dedent`
            Represents a usage or production event of a material within a step.

            The same material may appear in multiple material blocks across the recipe,
            as long as the total quantities used do not exceed the quantities provided
            (for input materials) or produced (for derived materials).

            Input-kind materials are:
            - "input"
            - "derived-input"

            Output-kind materials are:
            - "output"
            - "derived-output"

            Within a single step:
            - Input-kind materials must appear before any Output-kind materials.
            - If a step would require mixing material kinds in a way that violates these rules, the action must be split into multiple steps.
            - Represent materials inline using a material block of kind "input" or "derived-input", with quantity${/** and optional state*/ ""}.
            ${/**- When referencing materials, use the base material name whenever possible. Do NOT include the state in the material's name unless the state is a commonly recognized part of the material name (e.g., “whipped cream”), in that case, do not use the state field. Track any changes in state using the state field of the material block. Mention the state in the name only if it is necessary for clarity. */ ""}
            - Materials produced in the step ("output-kind") must appear as material blocks at the **end of the step**

            Across steps:
            - An "output-kind" material may appear at any point in the recipe, but only after all "input-kind" materials required to produce it have appeared earlier in the same step or in previous steps.
            - "output" materials may not be used to produce other materials.
            - Multiple output materials are allowed.
        `,
	});

export type MaterialBlock = Satisfies<
	z.infer<typeof MaterialBlockSchema>,
	RecipeMaterialBlock
>;

export const DurationBlockSchema = z
	.object({
		type: z.literal(RecipeStepBlockType.Duration),
		kind: z.enum(["prep", "cook"]),
		duration: z.iso.duration(), //? ISO 8601 duration (e.g., 'PT5M')
	})
	.meta({
		title: "Duration Block",
	});

export const TemperatureBlockSchema = z
	.object({
		type: z.literal(RecipeStepBlockType.Temperature),
		value: z.number(),
		unit: TemperatureUnitSchema,
	})
	.meta({
		title: "Temperature Block",
		description: dedent`
            - Must appear in the step where the temperature is first introduced.
            - Must be placed immediately after the plain text that introduces the heating context.
            - Must use the preferred temperature unit.
            - Do NOT encode tools or actions inside temperature blocks.
        `,
	});

export const ToolBlockSchema = z
	.object({
		type: z.literal(RecipeStepBlockType.Tool),
		name: z.string(),
	})
	.meta({
		title: "Tool Block",
	});

// export const ActionBlockSchema = z
// 	.object({
// 		type: z.literal(RecipeStepBlockType.Action),
// 		action: z.string(),
// 	})
// 	.meta({
// 		title: "Action Block",
// 	});

export const TextBlockSchema = z
	.object({
		type: z.literal(RecipeStepBlockType.Text),
		text: z.string(),
	})
	.meta({
		title: "Text Block",
	});

const schemaByBlockKind = {
	// [RecipeStepBlockType.Action]: ActionBlockSchema,
	[RecipeStepBlockType.Duration]: DurationBlockSchema,
	[RecipeStepBlockType.Material]: MaterialBlockSchema,
	[RecipeStepBlockType.Temperature]: TemperatureBlockSchema,
	[RecipeStepBlockType.Text]: TextBlockSchema,
	[RecipeStepBlockType.Tool]: ToolBlockSchema,
	// TODO: add reference blocks for referencing a material during a step without using it actively
} as const satisfies {
	[U in RecipeStepBlockType]: z.ZodObject<{
		type: z.ZodLiteral<U>;
	}>;
};

export const StepBlockSchema = z.union(Object.values(schemaByBlockKind));

const RecipeStepSchema = z
	.array(StepBlockSchema)
	.nonempty()
	.meta({
		title: "Recipe Step",
		description: dedent`
            - Material blocks must appear at the point in the step where the ingredient is used.
            - Duration blocks must be logically and naturally embedded within the textual instructions (e.g., 'Roast the potatoes for [DURATION] until golden' instead of 'Roast the potatoes until golden. [DURATION]'). Do NOT simply append time blocks at the end of a sentence.
            - Do NOT include in plain text that which can be expressed as a structured object.
            - Do NOT introduce any additional structured block types.
            - Steps must be readable as-is by a human when rendered sequentially.
            - Typed blocks (e.g., tool, temperature, time, material) must be inlined at the point in the step where they are necessary, interleaved with plain text so the step reads naturally when rendered sequentially.
            - Do not restate or duplicate information already expressed via a typed block in prior or later plain text, and do not append typed blocks at the end of a step if the corresponding concept was already referenced inline.
        `,
	});

export const RecipeGenOutputSchema = z
	.object({
		title: z.string().nonempty(),
		description: z.string().nonempty(),
		tags: z.array(z.string()),
		steps: z.array(RecipeStepSchema).nonempty(),
		notes: z.nullable(z.string()),
	})
	.meta({
		title: "Recipe",
		description:
			"The output should be formattable into plaintext. Mind that when structuring the blocks",
	});

export type RecipeGenOutput = Satisfies<
	z.infer<typeof RecipeGenOutputSchema>,
	StrictOmit<Recipe, "ingredients">
>;
