import dedent from "dedent";
import z from "zod";

import { RecipeGenInputSchema } from "../recipes";
import { HealthRecipeStepSchema } from "../recipes/schemas/health";

export const SafetyInputSchema = z.object({
	allergens: RecipeGenInputSchema.shape.allergens,
	dietaryPreferences: RecipeGenInputSchema.shape.dietaryPreferences,
	recipe: z.string(),
});

export type SafetyInput = z.infer<typeof SafetyInputSchema>;

const StepIndexSchema = z.number().meta({
	title: "Step Index",
	description:
		"The 0-based index of the specific step in the recipe that contains the safety hazard.",
});

export const InjectedStepSchema = z
	.object({
		targetIndex: StepIndexSchema,
		data: HealthRecipeStepSchema,
		position: z.enum(["BEFORE_INDEX", "AFTER_INDEX"]).meta({
			description:
				"Where this step should live structurally in the final recipe array.",
		}),
	})
	.meta({
		title: "Injected Health Step",
		description: dedent`
            Use this array ONLY for standard, preventative hygiene or prep actions (e.g., washing vegetables, washing hands, sanitizing surfaces).
            These actions will be cleanly injected by our backend without changing the underlying cooking flow.
            Natural Prose Rule: Interleave plain text blocks and typed blocks naturally so it reads as a single, fluent sentence.
            Example: [Text: "Wash the "] + [Material: name="potatoes"] + [Text: " thoroughly under running water."]
            Do not just dump raw text into a text block and leave the material block empty.
        `,
	});

export type InjectedStepShape = z.infer<typeof InjectedStepSchema>;

export const HazardTypeSchema = z.enum([
	"THERMAL_UNDERCOOKING",
	"CROSS_CONTAMINATION",
	"TOXIC_COMBINATION",
	"IMPROPER_TECHNIQUE",
	"UNSAFE_TIMING",
	"DIETARY_FORBIDDEN_INGREDIENT",
	"DIETARY_COMBINATION_VIOLATION",
	"OTHER",
]);

export const StructuralCriticismSchema = z
	.object({
		targetStepIndex: StepIndexSchema,
		hazardType: HazardTypeSchema.meta({
			title: "Safety Hazard Type",
			description:
				"The type of safety hazard. Must be one of the following: 'THERMAL_UNDERCOOKING', 'CROSS_CONTAMINATION', 'TOXIC_COMBINATION', 'IMPROPER_TECHNIQUE', 'UNSAFE_TIMING', 'DIETARY_FORBIDDEN_INGREDIENT', 'DIETARY_COMBINATION_VIOLATION', 'OTHER'.",
		}),
		issueDescription: z.string().meta({
			title: "Issue Description",
			description:
				"A detailed explanation of why this step is unsafe based on your database search results.",
		}),
		remediationGuideline: z.string().meta({
			description:
				"Clear instructions on what needs to be changed to make it safe (e.g., 'Increase the internal cooking temperature to at least 165°F/74°C').",
		}),
	})
	.meta({
		title: "Safety Hazard",
		description:
			"Use this ONLY if there is a severe safety hazard or absolute dietary violation built into the cooking process itself that requires the recipe, or parts of it, to be rewritten (e.g., dangerous material mixtures, internal temperatures too low to kill bacteria, or direct cross-contamination built into the core steps).",
	});

export type StructuralCriticism = z.infer<typeof StructuralCriticismSchema>;

export const SafetyOutputSchema = z.object({
	reasoning: z.string().meta({
		description:
			"A brief, high-level executive summary of the overall recipe safety and dietary evaluation. Do not list every individual step error here; provide a clean overview meant for the final user or system logs.",
	}),
	safetyScore: z.number().min(0).max(100).meta({
		title: "Safety Score",
		description:
			"A number between 0 and 100 representing the overall safety and dietary compliance of the recipe.",
	}),
	injectedSteps: z.array(InjectedStepSchema).meta({
		description:
			"Keep this array empty ([]) if there are no simple hygiene or prep actions to inject.",
	}),
	structuralCriticisms: z.array(StructuralCriticismSchema).meta({
		description:
			"Keep this array empty ([]) if there are no structural hazards.",
	}),
});

export type SafetyOutput = z.infer<typeof SafetyOutputSchema>;
