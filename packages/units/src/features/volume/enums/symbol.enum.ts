import type { ValueOf } from "@plateful/types";
import { Enum } from "@plateful/utils";
import { VolumeUnit } from "./unit.enum";

export const VolumeSymbol = {
	[VolumeUnit.Milliliter]: "mL",
	[VolumeUnit.Liter]: "L",
	[VolumeUnit.Pinch]: "pinch",
	[VolumeUnit.Teaspoon]: "tsp",
	[VolumeUnit.Dessertspoon]: "dsp",
	[VolumeUnit.Tablespoon]: "tbsp",
	[VolumeUnit.FluidOunce]: "fl oz",
	[VolumeUnit.Cup]: "cup",
	[VolumeUnit.Pint]: "pt",
	[VolumeUnit.Quart]: "qt",
	[VolumeUnit.Gallon]: "gal",
} as const satisfies Record<VolumeUnit, string>;

export type VolumeSymbol = ValueOf<typeof VolumeSymbol>;

export const volumeSymbols = Enum.toTuple(VolumeSymbol);
