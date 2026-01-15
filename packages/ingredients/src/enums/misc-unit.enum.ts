import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const MiscUnit = {
	Slice: "slice",
	Clove: "clove",
	Leaf: "leaf",
} as const;

export type MiscUnit = ValueOf<typeof MiscUnit>;

export const miscUnits = Enum.toTuple(MiscUnit);
