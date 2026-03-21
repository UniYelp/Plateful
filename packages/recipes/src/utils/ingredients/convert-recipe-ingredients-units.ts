import { convertIngredientUnits } from "@plateful/ingredients";
import { SCALAR_UNIT } from "../../constants";
import type { RecipeIngredientUnit } from "../../types/units";

export const convertRecipeIngredientsUnits = (
	from: RecipeIngredientUnit | undefined = SCALAR_UNIT,
	to: RecipeIngredientUnit | undefined = SCALAR_UNIT,
	initialValue: number,
): ReturnType<typeof convertIngredientUnits> => {
	if (from === to) return { value: initialValue, isLossy: false };

	const isFromScalar = Number(from === SCALAR_UNIT);
	const isToScalar = Number(to === SCALAR_UNIT);

	if (isFromScalar ^ isToScalar) {
		return null;
	}

	return convertIngredientUnits(from, to, initialValue);
};
