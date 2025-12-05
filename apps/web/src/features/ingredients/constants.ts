import { massUnitConversions, massUnits } from "@plateful/units/mass";
import type { ScalarUnitConversion } from "@plateful/units/scalar";
import { volumeUnitConversions, volumeUnits } from "@plateful/units/volume";
import { Arr } from "@plateful/utils";
import type { IngredientsUnit } from "./types";

export const ingredientsUnits: IngredientsUnit[] = Arr.concat(
	massUnits,
	volumeUnits,
);

export const ingredientsUnitConversions: ScalarUnitConversion<IngredientsUnit>[] =
	Arr.concat(massUnitConversions, volumeUnitConversions);
