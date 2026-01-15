import { convertIngredientUnits } from "@plateful/ingredients";
import { entriesOf } from "@plateful/utils";
import type { Doc } from "@backend/dataModel";
import { getGroupedTotalAmount } from "&/ingredients/utils/total-amount";
import { ScalarQuantity } from "&/units/constants";

type IsIngredientSufficientArgs = {
	ingredientQuantities: Doc<"ingredients">["quantities"];
	neededQuantities: Doc<"recipeIngredients">["quantities"];
};
export const isIngredientSufficient = ({
	ingredientQuantities,
	neededQuantities,
}: IsIngredientSufficientArgs) => {
	const existing = getGroupedTotalAmount(ingredientQuantities);
	const needed = getGroupedTotalAmount(neededQuantities);

    // TODO: write tests

	for (const [neededUnit, neededAmount] of entriesOf(needed)) {
		// Scalar: exact match only
		if (neededUnit === ScalarQuantity) {
			const available = existing[ScalarQuantity] ?? 0;
			if (available < neededAmount) return false;

			existing[ScalarQuantity] = available - neededAmount;
			continue;
		}

		let remainingNeeded = neededAmount;

		for (const [unit, amount] of entriesOf(existing)) {
			if (amount <= 0) continue;
			if (unit === ScalarQuantity) continue;

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
