import {
	MaterialInputKindsValues,
	MaterialOutputKindsValues,
	type RecipeMaterialKind,
} from "./enums";

export const MaterialInputKinds = new Set<RecipeMaterialKind>(
	MaterialInputKindsValues,
);

export const MaterialOutputKinds = new Set<RecipeMaterialKind>(
	MaterialOutputKindsValues,
);

export const UNLIMITED_QUANTITY = "unlimited";
