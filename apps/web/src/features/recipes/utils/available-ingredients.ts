import {
	consumeQuantity,
	type RecipeIngredientUnit,
	SCALAR_UNIT,
} from "@plateful/recipes";
import type { Doc } from "@backend/dataModel";
import { getGroupedTotalAmount } from "&/ingredients/utils/total-amount";

type IsIngredientSufficientArgs = {
	ingredientQuantities: Doc<"ingredients">["quantities"];
	neededQuantities: Doc<"recipeIngredients">["quantities"];
};

export const isIngredientSufficient = ({
	ingredientQuantities,
	neededQuantities,
}: IsIngredientSufficientArgs) => {
	if (neededQuantities.length === 0) return true;

	const needed = getGroupedTotalAmount(neededQuantities) as Map<
		RecipeIngredientUnit,
		number
	>;

	let available = getGroupedTotalAmount(ingredientQuantities) as Map<
		RecipeIngredientUnit,
		number
	>;

	for (const [unit, amount] of needed.entries()) {
		const res = consumeQuantity({
			available,
			consume: {
				value: amount,
				unit: unit === SCALAR_UNIT ? undefined : unit,
			},
		});

		if (res instanceof Error) return false;

		available = res;
	}

	return true;
};
