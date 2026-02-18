import type { ValueOf } from "@plateful/types";

export const RecipeSpiceLevel = {
	None: "no-spice",
	Mild: "mild",
	Medium: "medium",
	Hot: "hot",
	VeryHot: "very-hot",
	NoPreference: "no-preference",
} as const;

export type RecipeSpiceLevel = ValueOf<typeof RecipeSpiceLevel>;
