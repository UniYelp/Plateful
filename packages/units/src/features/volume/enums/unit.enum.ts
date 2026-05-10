import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";

export const VolumeUnit = {
	Milliliter: "milliliter",
	Liter: "liter",
	Pinch: "pinch",
	Teaspoon: "teaspoon",
	Dessertspoon: "dessertspoon",
	Tablespoon: "tablespoon",
	FluidOunce: "fluid-ounce",
	Cup: "cup",
	Pint: "pint",
	Quart: "quart",
	Gallon: "gallon",
} as const;

export type VolumeUnit = ValueOf<typeof VolumeUnit>;

export const volumeUnits = Enum.toTuple(VolumeUnit);
