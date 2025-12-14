import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const FoodUnit = {
	Slice: "slice",
	Clove: "clove",
	Leaf: "leaf",
} as const;

export type FoodUnit = ValueOf<typeof FoodUnit>;

export const foodUnits = Enum.toTuple(FoodUnit);
