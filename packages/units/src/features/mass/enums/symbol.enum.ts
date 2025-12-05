import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";
import { MassUnit } from "./unit.enum";

export const MassSymbol = {
	[MassUnit.Gram]: "g",
	[MassUnit.Kilogram]: "kg",
	[MassUnit.Ounce]: "oz",
	[MassUnit.Pound]: "lb",
} as const satisfies Record<MassUnit, string>;

export type MassSymbol = ValueOf<typeof MassSymbol>;

export const massSymbols = Enum.toTuple(MassSymbol);
