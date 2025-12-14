import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";
import { FoodUnit } from "./unit.enum";

export const FoodSymbol = {
	[FoodUnit.Slice]: FoodUnit.Slice,
	[FoodUnit.Clove]: FoodUnit.Clove,
	[FoodUnit.Leaf]: FoodUnit.Leaf,
} as const satisfies Record<FoodUnit, FoodUnit>;

export type FoodSymbol = ValueOf<typeof FoodSymbol>;

export const foodSymbols = Enum.toTuple(FoodSymbol);
