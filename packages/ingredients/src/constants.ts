import { massUnitConversions } from "@plateful/units/mass";
import type { ScalarUnitConversion } from "@plateful/units/scalar";
import { volumeUnitConversions } from "@plateful/units/volume";
import type { IngredientUnit } from "./enums";

export const ingredientsUnitConversions: ScalarUnitConversion<IngredientUnit>[] =
	[massUnitConversions, volumeUnitConversions].flat();
