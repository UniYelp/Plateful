import type { ValueOf } from "@plateful/types";

export const RecipeMaterialKind = {
	Input: "input",
	DerivedInput: "derived-input",
	DerivedOutput: "derived-output",
	Output: "output",
} as const;

export type RecipeMaterialKind = ValueOf<typeof RecipeMaterialKind>;
