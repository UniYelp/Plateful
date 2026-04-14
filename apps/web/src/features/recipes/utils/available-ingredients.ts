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

export const calculateMaxPortions = ({
	ingredientQuantities,
	neededQuantities,
}: IsIngredientSufficientArgs) => {
	if (neededQuantities.length === 0) return Number.POSITIVE_INFINITY;

	const needed = getGroupedTotalAmount(neededQuantities) as Map<
		RecipeIngredientUnit,
		number
	>;

	let available = getGroupedTotalAmount(ingredientQuantities) as Map<
		RecipeIngredientUnit,
		number
	>;

	let portions = 0;
	while (true) {
		let nextAvailable = available;
		let possible = true;

		for (const [unit, amount] of needed.entries()) {
			const res = consumeQuantity({
				available: nextAvailable,
				consume: {
					value: amount,
					unit: unit === SCALAR_UNIT ? undefined : unit,
				},
			});

			if (res instanceof Error) {
				possible = false;
				break;
			}

			nextAvailable = res;
		}

		if (!possible) break;
		available = nextAvailable;
		portions++;

		// Safety break to prevent infinite loops (though consumeQuantity should prevent it if amount > 0)
		if (portions > 1000) break;
	}

	return portions;
};

export const calculateRecipeMaxPortions = (
	ingredients: Array<{
		ingredient: { quantities: Doc<"ingredients">["quantities"] };
		quantities: Doc<"recipeIngredients">["quantities"];
	}>,
) => {
	if (ingredients.length === 0) return 0;

	const portionsPerIngredient = ingredients.map((ing) =>
		calculateMaxPortions({
			ingredientQuantities: ing.ingredient.quantities,
			neededQuantities: ing.quantities,
		}),
	);

	return Math.min(...portionsPerIngredient);
};
