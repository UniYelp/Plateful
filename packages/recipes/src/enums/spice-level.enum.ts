import type { ValueOf } from "@plateful/types";

export const RecipeSpiceLevel = {
	NoPreference: "no-preference",
	None: "no-spice",
	Mild: "mild",
	Medium: "medium",
	Hot: "hot",
	VeryHot: "very-hot",
} as const;

export type RecipeSpiceLevel = ValueOf<typeof RecipeSpiceLevel>;
