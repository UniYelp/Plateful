import type { ValueOf } from "@plateful/types";
import { MassSymbol } from "@plateful/units/mass";
import { VolumeSymbol } from "@plateful/units/volume";
import { Enum } from "@plateful/utils";
import { MiscSymbol } from "./misc-symbol.enum";
import type { IngredientUnit } from "./unit.enum";

export const IngredientSymbol = {
	...MassSymbol,
	...VolumeSymbol,
	...MiscSymbol,
} as const satisfies Record<IngredientUnit, string>;

export type IngredientSymbol = ValueOf<typeof IngredientSymbol>;

export const ingredientSymbols = Enum.toTuple(IngredientSymbol);
