import { createUnitConversion } from "@/features/units/utils";
import {
	ingredientsUnitConversions,
	ingredientsUnitsSymbols,
} from "./constants";

export const {
	convertUnits: convertIngredientsUnits,
	getConversions: getIngredientsUnitConversions,
} = createUnitConversion({
	units: ingredientsUnitsSymbols,
	conversions: ingredientsUnitConversions,
	getConversion: (c) => c.by,
	getReverseConversion: (c) => 1 / c.by,
	cost: (data) => data,
	calculate: (path, initialValue: number = 1) =>
		path.costs.reduce((acc, curr) => acc * curr, initialValue),
});
