import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const RecipeMaterialKind = {
	Input: "input",
	DerivedInput: "derived-input",
	DerivedOutput: "derived-output",
	Output: "output",
	Referenced: "referenced",
	Waste: "waste",
} as const;

export type RecipeMaterialKind = ValueOf<typeof RecipeMaterialKind>;

export const recipeMaterialKinds = Enum.toTuple(RecipeMaterialKind);

export const MaterialBlockKindsValues = [
	RecipeMaterialKind.Input,
	RecipeMaterialKind.DerivedInput,
	RecipeMaterialKind.DerivedOutput,
	RecipeMaterialKind.Output,
	RecipeMaterialKind.Referenced,
];

export type MaterialBlockKind =
	(typeof MaterialBlockKindsValues)[number];

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

export const MaterialAdornmentKindsValues = [RecipeMaterialKind.DerivedOutput];

export type MaterialAdornmentKind =
	(typeof MaterialAdornmentKindsValues)[number];

export const ReferenceMaterialKindsValues = [RecipeMaterialKind.Referenced];

export type ReferenceMaterialKind =
	(typeof ReferenceMaterialKindsValues)[number];

export const ByProductKindsValues = [
	RecipeMaterialKind.Waste,
	RecipeMaterialKind.DerivedOutput,
];

export type ByProductKind = (typeof ByProductKindsValues)[number];
