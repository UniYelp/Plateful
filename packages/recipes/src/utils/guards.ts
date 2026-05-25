import {
	MaterialAdornmentKinds,
	MaterialInputKinds,
	MaterialOutputKinds,
	ReferenceMaterialKinds,
} from "../constants";
import type {
	MaterialAdornmentKind,
	MaterialInputKind,
	MaterialOutputKind,
	RecipeMaterialKind,
	ReferenceMaterialKind,
} from "../enums";
import type { RecipeMaterial } from "../types";

export const isMaterialInputKind = (
	kind: RecipeMaterialKind,
): kind is MaterialInputKind => MaterialInputKinds.has(kind);

export const isMaterialOutputKind = (
	kind: RecipeMaterialKind,
): kind is MaterialOutputKind => MaterialOutputKinds.has(kind);

export const isMaterialAdornmentKind = (
	kind: RecipeMaterialKind,
): kind is MaterialAdornmentKind => MaterialAdornmentKinds.has(kind);

export const isReferenceMaterialKind = (
	kind: RecipeMaterialKind,
): kind is ReferenceMaterialKind => ReferenceMaterialKinds.has(kind);

export const isInputKindMaterial = (
	material: RecipeMaterial,
): material is RecipeMaterial<MaterialInputKind> =>
	isMaterialInputKind(material.kind);

export const isOutputKindMaterial = (
	material: RecipeMaterial,
): material is RecipeMaterial<MaterialOutputKind> =>
	isMaterialOutputKind(material.kind);
