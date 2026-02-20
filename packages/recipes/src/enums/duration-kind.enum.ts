import type { ValueOf } from "@plateful/types";

export const RecipeDurationKind = {
	Prep: "prep",
	Cook: "cook",
} as const;

export type RecipeDurationKind = ValueOf<typeof RecipeDurationKind>;
