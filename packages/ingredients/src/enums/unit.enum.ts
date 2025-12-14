import type { ValueOf } from "@plateful/types";
import { MassUnit } from "@plateful/units/mass";
import { VolumeUnit } from "@plateful/units/volume";
import { Enum } from "@plateful/utils";

export const FoodUnit = {
	Slice: "slice",
	Clove: "clove",
	Leaf: "leaf",
	...MassUnit,
	...VolumeUnit,
} as const;

export type FoodUnit = ValueOf<typeof FoodUnit>;

export const foodUnits = Enum.toTuple(FoodUnit);
