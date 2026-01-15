import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";
import { MiscUnit } from "./misc-unit.enum";

export const MiscSymbol = {
	[MiscUnit.Slice]: MiscUnit.Slice,
	[MiscUnit.Clove]: MiscUnit.Clove,
	[MiscUnit.Leaf]: MiscUnit.Leaf,
} as const satisfies Record<MiscUnit, string>;

export type MiscSymbol = ValueOf<typeof MiscSymbol>;

export const miscSymbols = Enum.toTuple(MiscSymbol);
