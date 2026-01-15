import type { ValueOf } from "@plateful/types";
import { MassUnit } from "@plateful/units/mass";
import { VolumeUnit } from "@plateful/units/volume";
import { Enum } from "@plateful/utils";
import { MiscUnit } from "./misc-unit.enum";

export const IngredientUnit = {
	...MassUnit,
	...VolumeUnit,
	...MiscUnit,
} as const;

export type IngredientUnit = ValueOf<typeof IngredientUnit>;

export const ingredientUnits = Enum.toTuple(IngredientUnit);
