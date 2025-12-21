import { IngredientSymbol, type IngredientUnit } from "@plateful/ingredients";
import type { SuggestStr } from "@plateful/types";

export const ingredientSymbolToDisplay = (unit?: SuggestStr<IngredientUnit>) =>
	IngredientSymbol[unit as IngredientUnit] ?? unit;
