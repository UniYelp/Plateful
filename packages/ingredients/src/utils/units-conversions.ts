import { scalarUnitConversion } from "@plateful/units/scalar";
import { ingredientsUnitConversions } from "../constants";
import { foodUnits } from "../enums";

export const {
	convertUnits: convertFoodUnits,
	getConversions: getFoodUnitConversions,
} = scalarUnitConversion(foodUnits, ingredientsUnitConversions);
