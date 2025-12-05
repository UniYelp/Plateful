import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const VolumeUnit = {
	Milliliter: "Milliliter",
	Liter: "Liter",
	Teaspoon: "Teaspoon",
	Dessertspoon: "Dessertspoon",
	Tablespoon: "Tablespoon",
	Cup: "Cup",
} as const;

export type VolumeUnit = ValueOf<typeof VolumeUnit>;

export const volumeUnits = Enum.toTuple(VolumeUnit);
