import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const VolumeUnit = {
	Milliliter: "milliliter",
	Liter: "liter",
	Teaspoon: "teaspoon",
	Dessertspoon: "dessertspoon",
	Tablespoon: "tablespoon",
	Cup: "cup",
} as const;

export type VolumeUnit = ValueOf<typeof VolumeUnit>;

export const volumeUnits = Enum.toTuple(VolumeUnit);
