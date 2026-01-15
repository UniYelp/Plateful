import type { ValueOf } from "@plateful/types";
import { UnitCategory } from "@plateful/units";

export const IngredientUnitCategory = {
	Mass: UnitCategory.Mass,
	Volume: UnitCategory.Volume,
	Misc: "Misc",
} as const;

export type IngredientUnitCategory = ValueOf<typeof IngredientUnitCategory>;
