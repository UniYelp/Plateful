import { unitsByCategory } from "@plateful/units";
import { massUnitConversions } from "@plateful/units/mass";
import type { ScalarUnitConversion } from "@plateful/units/scalar";
import { volumeUnitConversions } from "@plateful/units/volume";
import type { IngredientUnit } from "./enums";
import { miscUnits } from "./enums/misc-unit.enum";
import { IngredientUnitCategory } from "./enums/unit-category.enum";

const {
	[IngredientUnitCategory.Mass]: massUnits,
	[IngredientUnitCategory.Volume]: volumeUnits,
} = unitsByCategory;

export const ingredientUnitsByCategory = {
	[IngredientUnitCategory.Mass]: massUnits,
	[IngredientUnitCategory.Volume]: volumeUnits,
	[IngredientUnitCategory.Misc]: miscUnits,
} as const satisfies Record<IngredientUnitCategory, IngredientUnit[]>;

export const ingredientsUnitConversions: ScalarUnitConversion<IngredientUnit>[] =
	[massUnitConversions, volumeUnitConversions].flat();

export const EXPIRING_SOON_TIME_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export { aliasesByUnit } from "@plateful/units";

