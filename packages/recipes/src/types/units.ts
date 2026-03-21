import type { IngredientUnit } from "@plateful/ingredients";
import type { SCALAR_UNIT } from "../constants";

/**
 * @internal
 */
export type RecipeIngredientUnit = IngredientUnit | typeof SCALAR_UNIT;
