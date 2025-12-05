import { scalarUnitConversion } from "@plateful/units/scalar";
import { ingredientsUnitConversions, ingredientsUnits } from "./constants";

export const {
	convertUnits: convertIngredientsUnits,
	getConversions: getIngredientsUnitConversions,
} = scalarUnitConversion(ingredientsUnits, ingredientsUnitConversions);
