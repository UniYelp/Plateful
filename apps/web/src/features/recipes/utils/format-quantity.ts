import { IngredientSymbol, type IngredientUnit } from "@plateful/ingredients";

export const formatQuantity = (quantity: {
	unit?: string | undefined;
	amount: number;
}) => {
	// TODO: change to undefined for the user's locale
	const userLocale = "en-US";

	const { amount, unit } = quantity;

	try {
		return new Intl.NumberFormat(userLocale, {
			style: unit ? "unit" : "decimal",
			...(unit && { unit: unit.toLowerCase() }),
			unitDisplay: "short",
		}).format(amount);
	} catch (_e) {
		const numberPart = new Intl.NumberFormat(userLocale, {
			style: "decimal",
		}).format(amount);

		const unitSymbol: IngredientSymbol | IngredientUnit | "" = unit
			? (IngredientSymbol[unit.toLowerCase() as IngredientUnit] ?? unit)
			: "";

		return `${numberPart} ${unitSymbol}`.trim();
	}
};
