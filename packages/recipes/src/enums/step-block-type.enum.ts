import type { ValueOf } from "@plateful/types";

export const RecipeStepBlockType = {
	Text: "text",
	// Action: "action",
	Tool: "tool",
	Duration: "duration",
	Temperature: "temperature",
	Material: "material",
} as const;

export type RecipeStepBlockType = ValueOf<typeof RecipeStepBlockType>;
