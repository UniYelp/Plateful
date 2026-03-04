import type { IngredientUnit } from "@plateful/ingredients";
import type { Maybe } from "@plateful/types";
import type { UNLIMITED_QUANTITY } from "../constants";

export type Quantity = { value: number; unit?: Maybe<IngredientUnit> };

export type UnlimitedQuantity = typeof UNLIMITED_QUANTITY;
