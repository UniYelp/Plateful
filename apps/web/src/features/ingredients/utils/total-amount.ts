import type { IngredientUnit } from "@plateful/ingredients";
import { buildQuantitiesMap, SCALAR_UNIT } from "@plateful/recipes";
import { formatQuantity } from "&/recipes/utils/format-quantity";

export const getTotalAmount = (
	quantities: Array<{
		unit?: string | undefined;
		amount: number;
	}>,
) => {
	const quantityByUnit = getGroupedTotalAmount(quantities);

	const parts = Array.from(quantityByUnit.entries()).map(([unit, amount]) =>
		formatQuantity({
			unit: unit === SCALAR_UNIT ? undefined : unit,
			amount,
		}),
	);

	return parts.join(", ");
};

export const getGroupedTotalAmount = (
	quantities: Array<{
		unit?: string | undefined;
		amount: number;
	}>,
): Map<string, number> => {
	return buildQuantitiesMap(
		quantities.map((q) => ({
			value: q.amount,
			unit: q.unit === SCALAR_UNIT ? undefined : (q.unit as IngredientUnit),
		})),
	);
};
