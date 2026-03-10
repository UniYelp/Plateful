import type { ValueOf } from "@plateful/types";

export const RecipeMaterialKind = {
	Input: "input",
	DerivedInput: "derived-input",
	DerivedOutput: "derived-output",
	Output: "output",
} as const;

export type RecipeMaterialKind = ValueOf<typeof RecipeMaterialKind>;

export const MaterialInputKindsValues = [
	RecipeMaterialKind.Input,
	RecipeMaterialKind.DerivedInput,
];

export type MaterialInputKind = (typeof MaterialInputKindsValues)[number];

export const MaterialOutputKindsValues = [
	RecipeMaterialKind.Output,
	RecipeMaterialKind.DerivedOutput,
];

export type MaterialOutputKind = (typeof MaterialOutputKindsValues)[number];
