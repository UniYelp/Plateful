import type { ValueOf } from "@plateful/types";

export const RecipeTimeKind = {
	Prep: "prep",
	Cook: "cook",
} as const;

export type RecipeTimeKind = ValueOf<typeof RecipeTimeKind>;
