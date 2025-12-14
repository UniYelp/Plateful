import type { ValueOf } from "@plateful/types";
import { MassSymbol } from "@plateful/units/mass";
import { VolumeSymbol } from "@plateful/units/volume";
import { Enum } from "@plateful/utils";
import { FoodUnit } from "./unit.enum";

export const FoodSymbol = {
	[FoodUnit.Slice]: FoodUnit.Slice,
	[FoodUnit.Clove]: FoodUnit.Clove,
	[FoodUnit.Leaf]: FoodUnit.Leaf,
	...MassSymbol,
	...VolumeSymbol,
} as const satisfies Record<FoodUnit, string>;

export type FoodSymbol = ValueOf<typeof FoodSymbol>;

export const foodSymbols = Enum.toTuple(FoodSymbol);
