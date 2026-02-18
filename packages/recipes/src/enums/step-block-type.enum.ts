import type { ValueOf } from "@plateful/types";

export const RecipeStepBlockType = {
	PlainText: "plain-text",
	Tool: "tool",
	Duration: "duration",
	Temperature: "temperature",
	Material: "material",
} as const;

export type RecipeStepBlockType = ValueOf<typeof RecipeStepBlockType>;
