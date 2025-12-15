import type { ValueOf } from "@plateful/types";
import { MassSymbol } from "@plateful/units/mass";
import { VolumeSymbol } from "@plateful/units/volume";
import { Enum } from "@plateful/utils";
import { IngredientUnit } from "./unit.enum";

export const IngredientSymbol = {
	[IngredientUnit.Slice]: IngredientUnit.Slice,
	[IngredientUnit.Clove]: IngredientUnit.Clove,
	[IngredientUnit.Leaf]: IngredientUnit.Leaf,
	...MassSymbol,
	...VolumeSymbol,
} as const satisfies Record<IngredientUnit, string>;

export type IngredientSymbol = ValueOf<typeof IngredientSymbol>;

export const ingredientSymbols = Enum.toTuple(IngredientSymbol);
