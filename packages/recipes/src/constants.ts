import {
	MaterialAdornmentKindsValues,
	MaterialInputKindsValues,
	MaterialOutputKindsValues,
	type RecipeMaterialKind,
	ReferenceMaterialKindsValues,
} from "./enums";

export const MaterialInputKinds = new Set<RecipeMaterialKind>(
	MaterialInputKindsValues,
);

export const MaterialOutputKinds = new Set<RecipeMaterialKind>(
	MaterialOutputKindsValues,
);

export const MaterialAdornmentKinds = new Set<RecipeMaterialKind>(
	MaterialAdornmentKindsValues,
);

export const ReferenceMaterialKinds = new Set<RecipeMaterialKind>(
	ReferenceMaterialKindsValues,
);

export const UNLIMITED_QUANTITY = "unlimited";

export const SCALAR_UNIT = "__scalar__";
