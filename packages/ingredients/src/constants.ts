import { massUnitConversions } from "@plateful/units/mass";
import type { ScalarUnitConversion } from "@plateful/units/scalar";
import { volumeUnitConversions } from "@plateful/units/volume";
import { Arr } from "@plateful/utils";
import type { IngredientsUnit } from "./types";

export const ingredientsUnitConversions: ScalarUnitConversion<IngredientsUnit>[] =
	Arr.flatten(massUnitConversions, volumeUnitConversions);
