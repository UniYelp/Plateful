import { RecipeMaterialKind } from "./enums";

export const MaterialInputKindsValues = [
	RecipeMaterialKind.Input,
	RecipeMaterialKind.DerivedInput,
];

export const MaterialOutputKindsValues = [
	RecipeMaterialKind.Output,
	RecipeMaterialKind.DerivedOutput,
];

export const MaterialInputKinds = new Set<RecipeMaterialKind>(
	MaterialInputKindsValues,
);

export const MaterialOutputKinds = new Set<RecipeMaterialKind>(
	MaterialOutputKindsValues,
);
