import { SCALAR_UNIT } from "../../constants";
import type { Quantity } from "../../types";
import type { RecipeIngredientUnit } from "../../types/units";

export const buildQuantitiesMap = (
	quantities: ReadonlyArray<Readonly<Quantity>>,
): Map<RecipeIngredientUnit, number> => {
	const map = new Map<RecipeIngredientUnit, number>();

	for (const quantity of quantities) {
		const unit = quantity.unit ?? SCALAR_UNIT;
		const amount = map.get(unit) ?? 0;
		map.set(unit, amount + quantity.value);
	}

	return map;
};

export const buildQuantitiesArray = (
	quantities: ReadonlyMap<RecipeIngredientUnit, number>,
): Quantity[] => {
	if (!quantities.size) return [];

	return Array.from(quantities.entries()).flatMap(([unit, amount]) => {
		if (amount < 0) return [];

		return {
			unit: unit === SCALAR_UNIT ? undefined : unit,
			value: amount,
		};
	});
};
