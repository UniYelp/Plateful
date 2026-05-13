import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const MassUnit = {
	Milligram: "milligram",
	Gram: "gram",
	Kilogram: "kilogram",
	Ounce: "ounce",
	Pound: "pound",
} as const;

export type MassUnit = ValueOf<typeof MassUnit>;

export const massUnits = Enum.toTuple(MassUnit);
