import { scalarUnitConversion } from "@plateful/units/scalar";
import { ingredientsUnitConversions } from "../constants";
import { ingredientUnits } from "../enums";

export const {
	convertUnits: convertIngredientUnits,
	getConversions: getIngredientUnitConversions,
} = scalarUnitConversion(ingredientUnits, ingredientsUnitConversions);
