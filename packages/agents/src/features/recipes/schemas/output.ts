import dedent from "dedent";
import z from "zod";

import {
	type MaterialBlockKind,
	type Quantity,
	type Recipe,
	RecipeDurationKind,
	type RecipeMaterialBlock,
	RecipeMaterialKind,
	type RecipeStep,
	RecipeStepBlockType,
	RecipeStepPriority,
	recipeDurationKinds,
} from "@plateful/recipes";
import type { Satisfies } from "@plateful/types";
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

const ReferenceMaterialKindSchema = z
	.literal(RecipeMaterialKind.Referenced)
	.meta({
		title: "Reference Material Kind",
		description:
			"A material mentioned for context or passive handling without being altered, consumed, or bound to an output in this step (e.g., washing raw potatoes, or chilling dough).",
	});

const WasteMaterialKindSchema = z.literal(RecipeMaterialKind.Waste).meta({
	title: "Waste Material Kind",
	description:
		"A material that is produced as waste during the step (e.g. egg shells when making scrambled eggs, vegetable peels when peeling vegetables).",
});

const schemaByMaterialKind = {
	[InputMaterialKindSchema.value]: InputMaterialKindSchema,
	[DerivedInputMaterialKindSchema.value]: DerivedInputMaterialKindSchema,
	[OutputMaterialKindSchema.value]: OutputMaterialKindSchema,
	[DerivedOutputMaterialKindSchema.value]: DerivedOutputMaterialKindSchema,
	[ReferenceMaterialKindSchema.value]: ReferenceMaterialKindSchema,
} as const satisfies {
	[U in MaterialBlockKind]: z.ZodLiteral<U>;
};

export const RecipeMaterialKindSchema = z
	.union(Object.values(schemaByMaterialKind))
	.meta({
		title: "Recipe Material Kind",
	});

export const MaterialQuantitySchema = z
	.object({
		value: z.number(),
		unit: z.nullable(MaterialUnitSchema).optional().meta({
			description:
				"The unit of the material. Must be null if the ingredient inherently lacks one (e.g. '5 tomatoes' -> unit: null, value: 5). Do not hallucinate a unit here.",
		}),
	})
	.meta({
		title: "Material Quantity",
	});

export type MaterialQuantity = Satisfies<
	z.infer<typeof MaterialQuantitySchema>,
	Quantity
>;

export const MaterialBlockSchema = z
	.object({
		type: z.literal(RecipeStepBlockType.Material),
		kind: RecipeMaterialKindSchema,
		name: z.string(),
		quantity: MaterialQuantitySchema,
		// state: z.optional(z.string()).meta({
		// 	description: "The state of the material.",
		// }),
		// - When referencing materials, use the base material name whenever possible. Do NOT include the state in the material's name unless the state is a commonly recognized part of the material name (e.g., “whipped cream”), in that case, do not use the state field. Track any changes in state using the state field of the material block. Mention the state in the name only if it is necessary for clarity.
	})
	.meta({
		title: "Material Block",
		description: dedent`
            Represents a usage or production event of a material within a step.

            The same material may appear in multiple material blocks across the recipe,
            as long as the total quantities used do not exceed the quantities provided
            (for input materials) or produced (for derived materials).

            Input-kind materials are:
            - "${RecipeMaterialKind.Input}"
            - "${RecipeMaterialKind.DerivedInput}"

            Output-kind materials are:
            - "${RecipeMaterialKind.DerivedOutput}"
            - "${RecipeMaterialKind.Output}"

            Reference materials are:
            - "${RecipeMaterialKind.Referenced}"

            By-product materials are:
            - "${RecipeMaterialKind.Waste}"
            - "${RecipeMaterialKind.DerivedOutput}" (only if there is some leftover quantity after the recipe is made)

            Within a single step:
            - Input-kind and Reference materials must appear before any Output-kind materials.
            - If a step would require mixing material kinds in a way that violates these rules, the action must be split into multiple steps.
            - Represent materials inline using a material block of kind ${RecipeMaterialKind.Input} or ${RecipeMaterialKind.DerivedInput} with their quantity${/** and optional state*/ ""}.
            ${/**- When referencing materials, use the base material name whenever possible. Do NOT include the state in the material's name unless the state is a commonly recognized part of the material name (e.g., “whipped cream”), in that case, do not use the state field. Track any changes in state using the state field of the material block. Mention the state in the name only if it is necessary for clarity. */ ""}
			- Place ${RecipeMaterialKind.DerivedOutput} in "metadata.derivedOutputs" if the text flow does not explicitly mention it as an output (e.g. "Sear the beef" with a "Seared Beef" as an implicit ${RecipeMaterialKind.DerivedOutput} material metadata), but if it is explicitly mentioned in the text flow then it should remain as a block (e.g. "Bake the dough until it turns into a golden brown bread. Remove from oven and let cool." -> ${RecipeMaterialKind.DerivedOutput} remains a block and is not added to "metadata.derivedOutputs").

            Across steps:
            - An "output-kind" material may appear at any point in the recipe, but only after all input-kind materials required to produce it have appeared earlier.
            - ${RecipeMaterialKind.Output} and ${RecipeMaterialKind.Referenced} materials may not be used to produce other materials (they do not create new derived states).
            - Multiple ${RecipeMaterialKind.Output} materials are allowed.

            Health Steps Rule:
            - In a ${RecipeStepPriority.Health} step, all materials must be referenced materials.

            Lifecycle Example:
            - **Stage 1: Prep**
                - Action: Wash
                - Reference: Potatoes
            - **Stage 2: Sear**
                - Action: Sear
                - Input: Beef
                - Derived Output: Seared Beef
            - **Stage 3: Stew**
                - Action: Stew
                - Input: Broth
                - Derived Input: Seared Beef
                - Output: Beef Stew
        `,
	});

export type MaterialBlock = Satisfies<
	z.infer<typeof MaterialBlockSchema>,
	RecipeMaterialBlock
>;

export const DurationBlockSchema = z
	.object({
		type: z.literal(RecipeStepBlockType.Duration),
		kind: z.enum(recipeDurationKinds).meta({
			description: dedent`
                - Use these for times that MUST read naturally in the step's prose.
                - **${RecipeDurationKind.Prep}**: Active preparation text that needs to be explicitly read (e.g., "Whisk the eggs for 2 minutes").
                - **${RecipeDurationKind.Cook}**: Active cooking or process waiting times (e.g., "Simmer for 15 minutes", "Marinate for 2 hours").
                - *Rule:* The duration for both types must fluidly integrate into the generated text.
            `,
		}),
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

export const baseBlockSchemaByKind = {
	// [RecipeStepBlockType.Action]: ActionBlockSchema,
	[RecipeStepBlockType.Duration]: DurationBlockSchema,
	[RecipeStepBlockType.Temperature]: TemperatureBlockSchema,
	[RecipeStepBlockType.Text]: TextBlockSchema,
	[RecipeStepBlockType.Tool]: ToolBlockSchema,
} as const satisfies {
	[U in RecipeStepBlockType]?: z.ZodObject<{
		type: z.ZodLiteral<U>;
	}>;
};

const blockSchemaByKind = {
	...baseBlockSchemaByKind,
	[RecipeStepBlockType.Material]: MaterialBlockSchema,
} as const satisfies {
	[U in RecipeStepBlockType]: z.ZodObject<{
		type: z.ZodLiteral<U>;
	}>;
};

export const StepBlockSchema = z.union(Object.values(blockSchemaByKind));

export const MaterialWasteSchema = z
	.object({
		type: z.literal(RecipeStepBlockType.Material),
		kind: WasteMaterialKindSchema,
		name: z.string(),
		quantity: MaterialQuantitySchema,
	})
	.meta({
		title: "Material Waste Block",
		description: dedent`
            Represents a material that is produced as waste during the step (e.g. egg shells when making scrambled eggs, vegetable peels when peeling vegetables).
        `,
	});

export type MaterialWaste = Satisfies<
	z.infer<typeof MaterialWasteSchema>,
	NonNullable<NonNullable<RecipeStep["metadata"]>["waste"]>[number]
>;

export const DerivedOutputMaterialSchema = z
	.object({
		type: z.literal(RecipeStepBlockType.Material),
		kind: DerivedOutputMaterialKindSchema,
		name: z.string(),
		quantity: MaterialQuantitySchema,
	})
	.meta({
		title: "Derived Output Material",
		description: dedent`
            Implicit ${RecipeMaterialKind.DerivedOutput} materials produced during the step that WILL be consumed by future steps as a ${RecipeMaterialKind.DerivedInput}, but are not explicitly typed out in the text narrative (e.g., "Peel the potatoes" implicitly creates "Peeled Potatoes").
            Should follow all of the other rules as regular ${RecipeMaterialKind.DerivedOutput} materials, except they MUST NOT appear as material blocks in the step.

            Isolation Rule:
            - These materials are completely implicit to the step's written instructions.
            - They must remain strictly here in metadata and must not appear anywhere in the parent step's structural blocks array
        `,
	});

export type DerivedOutputMaterial = Satisfies<
	z.infer<typeof DerivedOutputMaterialSchema>,
	NonNullable<NonNullable<RecipeStep["metadata"]>["derivedOutputs"]>[number]
>;

const MandatoryStepPrioritySchema = z
	.literal(RecipeStepPriority.Mandatory)
	.meta({
		title: "Mandatory Step Priority",
		description:
			"A step that is required for the recipe to be considered complete.",
	});

export const HealthStepPrioritySchema = z
	.literal(RecipeStepPriority.Health)
	.meta({
		title: "Health Step Priority",
		description: dedent`
		A step that is recommended for the recipe to be considered healthy, but the recipe can still be made without it (e.g., removing excess fat from a meat cut, washing raw ingredients).
		${RecipeStepPriority.Health} steps may only use ${RecipeMaterialKind.Referenced} materials and mustn't affect the rest of the recipe (i.e. they can be omitted and the recipe should still be valid).
		A ${RecipeStepPriority.Health} step's metadata should not include any ${RecipeMaterialKind.DerivedOutput} or ${RecipeMaterialKind.Waste} materials.
	`,
	});

export const StepPrioritySchema = z.union([
	MandatoryStepPrioritySchema,
	HealthStepPrioritySchema,
]);

export const BaseStepMetadataSchema = z.object({
	setupTime: z.optional(z.iso.duration()).meta({
		description: dedent`
            - **Purpose:** Represents the hidden, hands-on labor required to process raw ingredients or prepare the station before executing the step (e.g., the 5 minutes spent chopping onions or mincing garlic).
            - *Rule:* This is metadata only. Do NOT include or mention this duration in the step's natural text description or reading flow.
        `,
	}),
	priority: StepPrioritySchema,
});

export const RecipeStepBlockMetaDesc = dedent`
    - Material blocks must appear at the point in the step where the ingredient is used.
    - Duration blocks must be logically and naturally embedded within the textual instructions (e.g., 'Roast the potatoes for [DURATION] until golden' instead of 'Roast the potatoes until golden. [DURATION]'). Do NOT simply append time blocks at the end of a sentence.
    - Do NOT include in plain text that which can be expressed as a structured object.
    - Do NOT introduce any additional structured block types.
    - Steps must be readable as-is by a human when rendered sequentially.
    - Typed blocks (e.g., tool, temperature, time, material) must be inlined at the point in the step where they are necessary, interleaved with plain text so the step reads naturally when rendered sequentially.
    - Do not restate or duplicate information already expressed via a typed block in prior or later plain text, and do not append typed blocks at the end of a step if the corresponding concept was already referenced inline.
`;

const RecipeStepBlocksSchema = z
	.array(StepBlockSchema)
	.nonempty()
	.meta({
		title: "Recipe Step Blocks",
		description: dedent`
            ${RecipeStepBlockMetaDesc}

            Crucial Rule:
            - Any material listed under metadata.derivedOutputs must not be generated as an inline structural block inside this step's blocks array
        `,
	});

export const StepMetadataSchema = z
	.object({
		...BaseStepMetadataSchema.shape,
		waste: z.array(MaterialWasteSchema).optional(),
		derivedOutputs: z.array(DerivedOutputMaterialSchema).optional(),
	})
	.meta({
		title: "Step Metadata",
	});

const RecipeStepSchema = z
	.object({
		blocks: RecipeStepBlocksSchema,
		metadata: StepMetadataSchema,
	})
	.meta({
		title: "Recipe Step",
	});

export type RecipeStepShape = Satisfies<
	z.infer<typeof RecipeStepSchema>,
	RecipeStep
>;

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
	Recipe
>;

export const UnfeasibleRecipeGenSchema = z.object({
	reason: z.string(),
});

export const RecipeGenResultSchema = z
	.object({
		type: z.enum(["unfeasible", "recipe"]),
		recipe: RecipeGenOutputSchema.optional(),
		unfeasible: UnfeasibleRecipeGenSchema.optional(),
	})
	.refine(
		(data) => {
			if (data.type === "recipe" && !data.recipe) {
				return false;
			}

			if (data.type === "unfeasible" && !data.unfeasible) {
				return false;
			}

			return true;
		},
		{
			message: "Must have either a recipe or an unfeasible reason",
		},
	);

export type RecipeGenResult = z.infer<typeof RecipeGenResultSchema>;
