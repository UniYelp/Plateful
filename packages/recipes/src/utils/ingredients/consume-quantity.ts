import { getIngredientUnitConversions } from "@plateful/ingredients";
import { SCALAR_UNIT } from "../../constants";
import { QuantityExceededError } from "../../models";
import type { Quantity } from "../../types";
import type { RecipeIngredientUnit } from "../../types/units";
import { convertRecipeIngredientsUnits } from "./convert-recipe-ingredients-units";

type Params = Readonly<{
	available: ReadonlyMap<RecipeIngredientUnit, number>;
	consume: Readonly<Quantity>;
}>;

export const consumeQuantity = (
	params: Params,
): Map<RecipeIngredientUnit, number> | QuantityExceededError => {
	const { available, consume } = params;

	const remaining = new Map(available);

	if (consume.value === 0) return remaining;

	const consumeCopy = structuredClone(consume);
	const unitToConsume = consumeCopy.unit ?? SCALAR_UNIT;

	let remainingAmountToConsume = consumeCopy.value;

	const conversions = getIngredientUnitConversions(unitToConsume);

	const allConversions = new Set<RecipeIngredientUnit>([
		unitToConsume,
		...conversions,
	]);

	while (remainingAmountToConsume > 0) {
		const availableUnit = Array.from(allConversions).find((unit) =>
			remaining.get(unit),
		);

		if (!availableUnit) break;

		allConversions.delete(availableUnit);
		const availableAmount = remaining.get(availableUnit) ?? 0;

		const amountToConsume =
			convertRecipeIngredientsUnits(
				unitToConsume,
				availableUnit,
				remainingAmountToConsume,
			)?.value ?? 0;

		const consumption = Math.min(availableAmount, amountToConsume);

		remaining.set(availableUnit, availableAmount - consumption);

		const consumedAmount =
			convertRecipeIngredientsUnits(availableUnit, unitToConsume, consumption)
				?.value ?? 0;

		remainingAmountToConsume -= consumedAmount;
	}

	if (remainingAmountToConsume > 0) {
		return new QuantityExceededError(
			consume,
			Array.from(available.entries()).map(([unit, amount]) => ({
				unit: unit === SCALAR_UNIT ? undefined : unit,
				value: amount,
			})),
		);
	}

	return remaining;
};
