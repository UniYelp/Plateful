import { massUnitConversions } from "@plateful/units/mass";
import type { ScalarUnitConversion } from "@plateful/units/scalar";
import { volumeUnitConversions } from "@plateful/units/volume";
import type { IngredientUnit } from "./enums";

export const ingredientsUnitConversions: ScalarUnitConversion<IngredientUnit>[] =
	[massUnitConversions, volumeUnitConversions].flat();

export const EXPIRING_SOON_TIME_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
