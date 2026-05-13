import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";
import { MiscUnit } from "./misc-unit.enum";

export const MiscSymbol = {
	[MiscUnit.Slice]: MiscUnit.Slice,
	[MiscUnit.Clove]: MiscUnit.Clove,
	[MiscUnit.Leaf]: MiscUnit.Leaf,
	[MiscUnit.Dash]: MiscUnit.Dash,
	[MiscUnit.Drop]: MiscUnit.Drop,
	[MiscUnit.Handful]: MiscUnit.Handful,
	[MiscUnit.Sprig]: MiscUnit.Sprig,
	[MiscUnit.Stalk]: MiscUnit.Stalk,
	[MiscUnit.Ear]: MiscUnit.Ear,
	[MiscUnit.Head]: MiscUnit.Head,
	[MiscUnit.Bunch]: MiscUnit.Bunch,
	[MiscUnit.Piece]: MiscUnit.Piece,
	[MiscUnit.Can]: MiscUnit.Can,
	[MiscUnit.Bottle]: MiscUnit.Bottle,
	[MiscUnit.Package]: MiscUnit.Package,
	[MiscUnit.Box]: MiscUnit.Box,
	[MiscUnit.Bag]: MiscUnit.Bag,
	[MiscUnit.Jar]: MiscUnit.Jar,
	[MiscUnit.Scoop]: MiscUnit.Scoop,
} as const satisfies Record<MiscUnit, string>;

export type MiscSymbol = ValueOf<typeof MiscSymbol>;

export const miscSymbols = Enum.toTuple(MiscSymbol);
