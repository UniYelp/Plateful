import { MaterialInputKinds, MaterialOutputKinds } from "../constants";
import type {
	MaterialInputKind,
	MaterialOutputKind,
	RecipeMaterialKind,
} from "../enums";
import type { RecipeMaterial } from "../types";

export const isMaterialInputKind = (
	kind: RecipeMaterialKind,
): kind is MaterialInputKind => MaterialInputKinds.has(kind);

export const isMaterialOutputKind = (
	kind: RecipeMaterialKind,
): kind is MaterialOutputKind => MaterialOutputKinds.has(kind);

export const isInputKindMaterial = (
	material: RecipeMaterial,
): material is RecipeMaterial<MaterialInputKind> =>
	isMaterialInputKind(material.kind);

export const isOutputKindMaterial = (
	material: RecipeMaterial,
): material is RecipeMaterial<MaterialOutputKind> =>
	isMaterialOutputKind(material.kind);
