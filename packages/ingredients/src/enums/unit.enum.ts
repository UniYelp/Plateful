import type { ValueOf } from "@plateful/types";
import { MassUnit } from "@plateful/units/mass";
import { VolumeUnit } from "@plateful/units/volume";
import { Enum } from "@plateful/utils";

export const IngredientUnit = {
	Slice: "slice",
	Clove: "clove",
	Leaf: "leaf",
	...MassUnit,
	...VolumeUnit,
} as const;

export type IngredientUnit = ValueOf<typeof IngredientUnit>;

export const ingredientUnits = Enum.toTuple(IngredientUnit);
