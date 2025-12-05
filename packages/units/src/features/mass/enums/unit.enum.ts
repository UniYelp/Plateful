import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const MassUnit = {
	Gram: "Gram",
	Kilogram: "Kilogram",
	Ounce: "Ounce",
	Pound: "Pound",
} as const;

export type MassUnit = ValueOf<typeof MassUnit>;

export const massUnits = Enum.toTuple(MassUnit);
