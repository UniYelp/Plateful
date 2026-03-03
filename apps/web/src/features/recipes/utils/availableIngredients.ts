import { convertIngredientUnits } from "@plateful/ingredients";
import { entriesOf } from "@plateful/utils";
import type { Doc } from "@backend/dataModel";
import { getGroupedTotalAmount, SCALAR_QUANTITY_KEY } from "&/ingredients/utils/total-amount";

type IsIngredientSufficientArgs = {
	ingredientQuantities: Doc<"ingredients">["quantities"];
	neededQuantities: Doc<"recipeIngredients">["quantities"];
};
export const isIngredientSufficient = ({
	ingredientQuantities,
	neededQuantities,
}: IsIngredientSufficientArgs) => {
	if (neededQuantities.length === 0) return false;

	const existing = getGroupedTotalAmount(ingredientQuantities);
	const needed = getGroupedTotalAmount(neededQuantities);

    // TODO: write tests

	for (const [neededUnit, neededAmount] of entriesOf(needed)) {
		if (neededUnit === SCALAR_QUANTITY_KEY) {
			const available = existing[SCALAR_QUANTITY_KEY] ?? 0;
			if (available < neededAmount) return false;

			existing[SCALAR_QUANTITY_KEY] = available - neededAmount;
			continue;
		}

		let remainingNeeded = neededAmount;

		for (const [unit, amount] of entriesOf(existing)) {
			if (amount <= 0) continue;
			if (unit === SCALAR_QUANTITY_KEY) continue;

			const converted = convertIngredientUnits(unit, neededUnit, amount);

			if (converted === null) continue;

			const used = Math.min(converted.value, remainingNeeded);

			// convert used back to original unit so we subtract correctly
			const usedInOriginalUnit =
				unit === neededUnit
					? used
					: convertIngredientUnits(neededUnit, unit, used)?.value;

			if (usedInOriginalUnit) {
				existing[unit] -= usedInOriginalUnit;
			}
            
			remainingNeeded -= used;

			if (remainingNeeded <= 0) break;
		}

		if (remainingNeeded > 0) return false;
	}

	return true;
};
